import os
import shutil
import sqlite3
import time
from pathlib import Path
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from backend.config import settings

class SessionRecord(BaseModel):
    session_id: str
    task_type: str
    workspace_path: str
    timestamp: float
    files_analyzed: int
    suggestions_count: int
    executed_count: int
    failed_count: int
    skipped_count: int
    is_undone: bool = False

class JournalRecord(BaseModel):
    id: int
    session_id: str
    source_path: str
    destination_path: str
    status: str
    timestamp: float
    is_undone: bool = False

class HistoryManager:
    def __init__(self, db_path: Path = settings.db_path):
        self.db_path = db_path
        self._init_db()

    from contextlib import contextmanager

    @contextmanager
    def _connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self):
        """Initializes SQLite schema for sessions and operation journal."""
        with self._connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    task_type TEXT NOT NULL,
                    workspace_path TEXT NOT NULL,
                    timestamp REAL NOT NULL,
                    files_analyzed INTEGER NOT NULL,
                    suggestions_count INTEGER NOT NULL,
                    executed_count INTEGER NOT NULL,
                    failed_count INTEGER NOT NULL,
                    skipped_count INTEGER NOT NULL,
                    is_undone INTEGER DEFAULT 0
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS journal (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    source_path TEXT NOT NULL,
                    destination_path TEXT NOT NULL,
                    status TEXT NOT NULL,
                    timestamp REAL NOT NULL,
                    is_undone INTEGER DEFAULT 0,
                    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                )
            """)
            conn.commit()

    def record_session(
        self,
        session_id: str,
        task_type: str,
        workspace_path: str,
        files_analyzed: int,
        suggestions_count: int,
        executed_count: int,
        failed_count: int,
        skipped_count: int,
        journal_actions: List[Dict[str, str]],
    ):
        now = time.time()
        with self._connection() as conn:
            conn.execute("""
                INSERT INTO sessions (
                    session_id, task_type, workspace_path, timestamp,
                    files_analyzed, suggestions_count, executed_count,
                    failed_count, skipped_count, is_undone
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            """, (
                session_id, task_type, workspace_path, now,
                files_analyzed, suggestions_count, executed_count,
                failed_count, skipped_count
            ))

            for action in journal_actions:
                if action.get("status") == "executed":
                    conn.execute("""
                        INSERT INTO journal (
                            session_id, source_path, destination_path, status, timestamp, is_undone
                        ) VALUES (?, ?, ?, ?, ?, 0)
                    """, (
                        session_id,
                        action["source_path"],
                        action["destination_path"],
                        action["status"],
                        now
                    ))
            conn.commit()

    def list_sessions(self, limit: int = 50) -> List[SessionRecord]:
        with self._connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM sessions ORDER BY timestamp DESC LIMIT ?
            """, (limit,))
            return [
                SessionRecord(
                    session_id=row["session_id"],
                    task_type=row["task_type"],
                    workspace_path=row["workspace_path"],
                    timestamp=row["timestamp"],
                    files_analyzed=row["files_analyzed"],
                    suggestions_count=row["suggestions_count"],
                    executed_count=row["executed_count"],
                    failed_count=row["failed_count"],
                    skipped_count=row["skipped_count"],
                    is_undone=bool(row["is_undone"]),
                )
                for row in cursor.fetchall()
            ]

    def get_session_journal(self, session_id: str) -> List[JournalRecord]:
        with self._connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM journal WHERE session_id = ? ORDER BY id ASC
            """, (session_id,))
            return [
                JournalRecord(
                    id=row["id"],
                    session_id=row["session_id"],
                    source_path=row["source_path"],
                    destination_path=row["destination_path"],
                    status=row["status"],
                    timestamp=row["timestamp"],
                    is_undone=bool(row["is_undone"]),
                )
                for row in cursor.fetchall()
            ]

    def undo_session(self, session_id: str) -> Dict[str, Any]:
        """
        Reverses all executed operations in the given session.
        Moves files back from destination_path to source_path.
        """
        journal_entries = self.get_session_journal(session_id)
        if not journal_entries:
            return {"success": False, "message": "No executed operations found for this session."}

        reversed_count = 0
        failed_count = 0
        errors: List[str] = []

        with self._connection() as conn:
            for entry in reversed(journal_entries):
                if entry.is_undone:
                    continue

                curr_path = Path(entry.destination_path)
                target_orig = Path(entry.source_path)

                if not curr_path.exists():
                    failed_count += 1
                    errors.append(f"File at {curr_path} no longer exists to revert.")
                    continue

                try:
                    # Ensure original parent folder exists
                    target_orig.parent.mkdir(parents=True, exist_ok=True)

                    # Check collision at original path
                    if target_orig.exists():
                        target_orig = Path(f"{target_orig.stem}_undone{target_orig.suffix}")

                    shutil.move(str(curr_path), str(target_orig))
                    conn.execute("UPDATE journal SET is_undone = 1 WHERE id = ?", (entry.id,))
                    reversed_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append(f"Failed to revert {curr_path}: {str(e)}")

            # Check if all journal entries are now undone
            conn.execute("""
                UPDATE sessions SET is_undone = 1 WHERE session_id = ?
            """, (session_id,))
            conn.commit()

        return {
            "success": failed_count == 0,
            "session_id": session_id,
            "reversed_count": reversed_count,
            "failed_count": failed_count,
            "errors": errors,
        }

    def clear_history(self):
        """Clears all session and journal records."""
        with self._connection() as conn:
            conn.execute("DELETE FROM journal")
            conn.execute("DELETE FROM sessions")
            conn.commit()

history_manager = HistoryManager()
