import os
import time
from pathlib import Path
from typing import Dict, List, Optional
from pydantic import BaseModel
from backend.config import settings
from backend.hasher import find_duplicate_files, DuplicateGroup

class FileInfo(BaseModel):
    name: str
    path: str
    relative_path: str
    size_bytes: int
    extension: str
    category: str
    modified_timestamp: float
    is_supported: bool
    can_extract_text: bool
    is_archive_candidate: bool = False

class ScanResult(BaseModel):
    directory_path: str
    total_files: int
    total_folders: int
    total_size_bytes: int
    extension_counts: Dict[str, int]
    category_counts: Dict[str, int]
    largest_files: List[FileInfo]
    archive_candidates: List[FileInfo]
    duplicates: List[DuplicateGroup]
    files: List[FileInfo]
    unsupported_count: int
    scan_duration_ms: float
    error: Optional[str] = None

def get_category_for_extension(ext: str) -> str:
    ext = ext.lower()
    if ext in settings.document_extensions:
        return "Documents"
    elif ext in settings.image_extensions:
        return "Images & Media"
    elif ext in settings.archive_extensions:
        return "Archives"
    elif ext in settings.code_extensions:
        return "Code & Dev"
    elif ext in settings.audio_video_extensions:
        return "Audio & Video"
    return "Miscellaneous"

def scan_directory(dir_path: str | Path, max_depth: int = 4) -> ScanResult:
    start_time = time.time()
    root_path = Path(dir_path).resolve()

    if not root_path.exists() or not root_path.is_dir():
        return ScanResult(
            directory_path=str(root_path),
            total_files=0,
            total_folders=0,
            total_size_bytes=0,
            extension_counts={},
            category_counts={},
            largest_files=[],
            archive_candidates=[],
            duplicates=[],
            files=[],
            unsupported_count=0,
            scan_duration_ms=0,
            error=f"Directory does not exist or cannot be accessed: {dir_path}"
        )

    all_files: List[FileInfo] = []
    file_paths_for_hashing: List[Path] = []
    folder_count = 0
    total_size = 0
    ext_counts: Dict[str, int] = {}
    cat_counts: Dict[str, int] = {}
    unsupported_count = 0

    now = time.time()
    archive_threshold_seconds = 90 * 24 * 3600  # 90 days

    for dirpath, dirnames, filenames in os.walk(root_path, topdown=True):
        # Calculate current depth
        rel_dir = Path(dirpath).relative_to(root_path)
        depth = len(rel_dir.parts)
        if depth >= max_depth:
            dirnames.clear()  # Do not recurse deeper than max_depth

        # Filter out dangerous/ignored directories in-place
        dirnames[:] = [
            d for d in dirnames
            if d not in settings.skip_directories and not d.startswith(".")
        ]
        folder_count += len(dirnames)

        for fname in filenames:
            if fname.lower() in settings.skip_files or fname.startswith("."):
                continue

            full_path = Path(dirpath) / fname
            # Never follow symlinks
            if full_path.is_symlink():
                continue

            try:
                stat = full_path.stat()
                size = stat.st_size
                mtime = stat.st_mtime
                ext = full_path.suffix.lower() or "no_extension"

                category = get_category_for_extension(ext)
                is_supported = (
                    ext in settings.document_extensions
                    or ext in settings.image_extensions
                    or ext in settings.archive_extensions
                    or ext in settings.code_extensions
                    or ext in settings.audio_video_extensions
                )

                can_extract = ext in settings.document_extensions or ext in settings.code_extensions
                is_archive = (now - mtime > archive_threshold_seconds) or (size > 50 * 1024 * 1024)

                rel_path = str(full_path.relative_to(root_path))

                file_info = FileInfo(
                    name=fname,
                    path=str(full_path),
                    relative_path=rel_path,
                    size_bytes=size,
                    extension=ext,
                    category=category,
                    modified_timestamp=mtime,
                    is_supported=is_supported,
                    can_extract_text=can_extract,
                    is_archive_candidate=is_archive,
                )

                all_files.append(file_info)
                file_paths_for_hashing.append(full_path)
                total_size += size

                ext_counts[ext] = ext_counts.get(ext, 0) + 1
                cat_counts[category] = cat_counts.get(category, 0) + 1

                if not is_supported:
                    unsupported_count += 1

            except (OSError, PermissionError):
                continue

    # Largest files
    largest_files = sorted(all_files, key=lambda f: f.size_bytes, reverse=True)[:10]

    # Archive candidates (e.g. older or large)
    archive_candidates = [f for f in all_files if f.is_archive_candidate][:20]

    # Duplicates detection
    duplicates = find_duplicate_files(file_paths_for_hashing)

    scan_ms = (time.time() - start_time) * 1000

    return ScanResult(
        directory_path=str(root_path),
        total_files=len(all_files),
        total_folders=folder_count,
        total_size_bytes=total_size,
        extension_counts=ext_counts,
        category_counts=cat_counts,
        largest_files=largest_files,
        archive_candidates=archive_candidates,
        duplicates=duplicates,
        files=all_files,
        unsupported_count=unsupported_count,
        scan_duration_ms=round(scan_ms, 2),
    )
