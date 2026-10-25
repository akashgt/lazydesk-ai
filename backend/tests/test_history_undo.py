import pytest
import tempfile
from pathlib import Path
from backend.history import HistoryManager

def test_session_journal_and_undo():
    with tempfile.TemporaryDirectory() as tmp_dir:
        db_file = Path(tmp_dir) / "test_history.db"
        hm = HistoryManager(db_path=db_file)

        src = Path(tmp_dir) / "source_file.txt"
        dest = Path(tmp_dir) / "Organized" / "destination_file.txt"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text("content to be reverted", encoding="utf-8")

        session_id = "test_sess_001"
        journal_actions = [
            {
                "source_path": str(src),
                "destination_path": str(dest),
                "status": "executed"
            }
        ]

        hm.record_session(
            session_id=session_id,
            task_type="Smart Organizer",
            workspace_path=tmp_dir,
            files_analyzed=1,
            suggestions_count=1,
            executed_count=1,
            failed_count=0,
            skipped_count=0,
            journal_actions=journal_actions,
        )

        sessions = hm.list_sessions()
        assert len(sessions) == 1
        assert sessions[0].session_id == session_id

        journal = hm.get_session_journal(session_id)
        assert len(journal) == 1
        assert journal[0].status == "executed"
        assert journal[0].is_undone is False

        # Execute Undo
        undo_result = hm.undo_session(session_id)
        assert undo_result["success"] is True
        assert undo_result["reversed_count"] == 1

        # File moved back to source
        assert not dest.exists()
        assert src.exists()
        assert src.read_text() == "content to be reverted"

        # Check journal entry updated
        journal_after = hm.get_session_journal(session_id)
        assert journal_after[0].is_undone is True
