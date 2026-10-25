import pytest
import tempfile
from pathlib import Path
from backend.organizer import (
    validate_path_safety,
    resolve_collision_path,
    create_action_plan,
    execute_action_plan,
)

def test_validate_path_safety():
    with tempfile.TemporaryDirectory() as tmp_dir:
        root = Path(tmp_dir).resolve()
        
        # Valid path inside root
        valid_dest = root / "Documents" / "file.pdf"
        is_safe, err = validate_path_safety(root, valid_dest)
        assert is_safe is True
        assert err is None

        # Path traversal escaping root
        escaped_dest = root / ".." / "system_secret.txt"
        is_safe, err = validate_path_safety(root, escaped_dest)
        assert is_safe is False
        assert "Security violation" in err

def test_resolve_collision_path():
    with tempfile.TemporaryDirectory() as tmp_dir:
        root = Path(tmp_dir)
        target = root / "report.pdf"
        target.write_text("existing", encoding="utf-8")

        resolved = resolve_collision_path(target)
        assert resolved.name == "report_1.pdf"
        assert not resolved.exists()

def test_dry_run_and_execution_safety():
    with tempfile.TemporaryDirectory() as tmp_dir:
        root = Path(tmp_dir)
        f1 = root / "messy1.txt"
        f2 = root / "messy2.txt"
        f1.write_text("file 1 content", encoding="utf-8")
        f2.write_text("file 2 content", encoding="utf-8")

        suggestions = [
            {
                "original_path": str(f1),
                "proposed_name": "clean_1.txt",
                "proposed_category": "Documents",
                "explanation": "Tidy file",
            },
            {
                "original_path": str(f2),
                "proposed_name": "clean_2.txt",
                "proposed_category": "Documents",
                "explanation": "Tidy file 2",
            }
        ]

        # 1. Action plan (Dry Run)
        plan = create_action_plan(root, suggestions)
        assert plan.is_dry_run is True
        assert len(plan.actions) == 2
        
        # Verify no files were moved during dry-run
        assert f1.exists()
        assert f2.exists()
        assert not (root / "Documents" / "clean_1.txt").exists()

        # 2. Execution only on approved file f1
        result = execute_action_plan(plan, approved_action_ids=["act_1"])
        assert result.succeeded_count == 1
        assert result.skipped_count == 1

        # f1 moved to Documents/clean_1.txt
        assert not f1.exists()
        assert (root / "Documents" / "clean_1.txt").exists()
        assert (root / "Documents" / "clean_1.txt").read_text() == "file 1 content"

        # f2 was skipped and still exists at original path
        assert f2.exists()
