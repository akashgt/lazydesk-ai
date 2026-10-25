import pytest
import tempfile
from pathlib import Path
from backend.hasher import compute_file_hash, find_duplicate_files

def test_compute_file_hash_and_find_duplicates():
    with tempfile.TemporaryDirectory() as tmp_dir:
        root = Path(tmp_dir)
        content_a = b"Unique content A"
        content_b = b"Identical content for duplicate test 123456789"
        
        f1 = root / "file1.txt"
        f2 = root / "file2.txt"
        f3 = root / "unique.txt"

        f1.write_bytes(content_b)
        f2.write_bytes(content_b)
        f3.write_bytes(content_a)

        h1 = compute_file_hash(f1)
        h2 = compute_file_hash(f2)
        h3 = compute_file_hash(f3)

        assert h1 == h2
        assert h1 != h3

        dups = find_duplicate_files([f1, f2, f3])
        assert len(dups) == 1
        assert dups[0].count == 2
        assert dups[0].file_size_bytes == len(content_b)
        assert dups[0].wasted_bytes == len(content_b)
