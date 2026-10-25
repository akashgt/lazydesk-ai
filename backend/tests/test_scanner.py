import pytest
import tempfile
from pathlib import Path
from backend.scanner import scan_directory, get_category_for_extension

def test_get_category_for_extension():
    assert get_category_for_extension(".pdf") == "Documents"
    assert get_category_for_extension(".docx") == "Documents"
    assert get_category_for_extension(".png") == "Images & Media"
    assert get_category_for_extension(".zip") == "Archives"
    assert get_category_for_extension(".py") == "Code & Dev"
    assert get_category_for_extension(".xyz123") == "Miscellaneous"

def test_scan_directory():
    with tempfile.TemporaryDirectory() as tmp_dir:
        root = Path(tmp_dir)
        (root / "doc1.pdf").write_text("dummy pdf content", encoding="utf-8")
        (root / "photo.png").write_bytes(b"\x89PNG\r\n\x1a\n")
        (root / "script.py").write_text("print('hello')", encoding="utf-8")
        
        # Ignored dir
        git_dir = root / ".git"
        git_dir.mkdir()
        (git_dir / "config").write_text("git config", encoding="utf-8")

        result = scan_directory(root)
        
        assert result.error is None
        assert result.total_files == 3  # .git should be ignored
        assert result.extension_counts[".pdf"] == 1
        assert result.extension_counts[".png"] == 1
        assert result.extension_counts[".py"] == 1
        assert result.category_counts["Documents"] == 1
        assert result.category_counts["Images & Media"] == 1
        assert result.category_counts["Code & Dev"] == 1
