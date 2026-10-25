import hashlib
import os
from pathlib import Path
from typing import Dict, List
from pydantic import BaseModel

class DuplicateGroup(BaseModel):
    file_hash: str
    file_size_bytes: int
    file_paths: List[str]
    count: int
    wasted_bytes: int

def compute_file_hash(file_path: Path, block_size: int = 65536) -> str:
    """Computes SHA-256 hash of a file safely in streaming blocks."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(block_size), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

def find_duplicate_files(file_paths: List[Path]) -> List[DuplicateGroup]:
    """
    Identifies duplicate files using an optimized 2-step approach:
    1. Group files by exact byte size.
    2. Compute SHA-256 only for files with identical sizes (> 0 bytes).
    """
    size_map: Dict[int, List[Path]] = {}
    for p in file_paths:
        try:
            if p.is_file() and not p.is_symlink():
                size = p.stat().st_size
                if size > 0:
                    size_map.setdefault(size, []).append(p)
        except (OSError, PermissionError):
            continue

    duplicate_groups: List[DuplicateGroup] = []

    for size, paths in size_map.items():
        if len(paths) < 2:
            continue

        hash_map: Dict[str, List[str]] = {}
        for p in paths:
            try:
                fhash = compute_file_hash(p)
                hash_map.setdefault(fhash, []).append(str(p.resolve()))
            except (OSError, PermissionError):
                continue

        for fhash, matched_paths in hash_map.items():
            if len(matched_paths) > 1:
                duplicate_groups.append(
                    DuplicateGroup(
                        file_hash=fhash,
                        file_size_bytes=size,
                        file_paths=matched_paths,
                        count=len(matched_paths),
                        wasted_bytes=size * (len(matched_paths) - 1),
                    )
                )

    # Sort groups by wasted bytes descending
    duplicate_groups.sort(key=lambda g: g.wasted_bytes, reverse=True)
    return duplicate_groups
