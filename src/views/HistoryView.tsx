import React, { useState } from 'react';
import {
  Clock,
  Undo2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { SessionRecord, JournalRecord } from '../types';
import * as api from '../api';

interface HistoryViewProps {
  sessions: SessionRecord[];
  onRefresh: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onRefresh }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalRecord[]>([]);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const [undoingSessionId, setUndoingSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSelectSession = async (sessionId: string) => {
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
      setJournalEntries([]);
      return;
    }

    setSelectedSessionId(sessionId);
    setLoadingJournal(true);
    try {
      const entries = await api.getJournal(sessionId);
      setJournalEntries(entries);
    } catch (e: any) {
      alert(`Failed to load journal: ${e.message}`);
    } finally {
      setLoadingJournal(false);
    }
  };

  const handleUndo = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revert all file moves from this session?')) return;
    setUndoingSessionId(sessionId);
    setMessage(null);

    try {
      const res = await api.undoSession(sessionId);
      setMessage(`Successfully reverted ${res.reversed_count} files to their original locations.`);
      onRefresh();
      // Re-load journal
      const entries = await api.getJournal(sessionId);
      setJournalEntries(entries);
    } catch (e: any) {
      alert(`Undo failed: ${e.message}`);
    } finally {
      setUndoingSessionId(null);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear all activity logs? (This does not touch your actual files on disk)')) return;
    try {
      await api.clearHistory();
      setSelectedSessionId(null);
      setJournalEntries([]);
      onRefresh();
      setMessage('Activity history cleared.');
    } catch (e: any) {
      alert(`Failed to clear history: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="sloth-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-brand flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-800" />
            <span>Activity History & Undo Journal</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Every file move and rename is persisted in a local SQLite database. Revert changes anytime with 1-click Undo.
          </p>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="sloth-btn-ghost text-xs text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="sloth-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 font-brand">No Activity Logged Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Run an organization session or Lazy Mode to populate the safety journal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((sess) => {
            const isSelected = selectedSessionId === sess.session_id;
            const isUndoing = undoingSessionId === sess.session_id;

            return (
              <div key={sess.session_id} className="sloth-card overflow-hidden transition-all">
                <div
                  onClick={() => handleSelectSession(sess.session_id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-stone-400 hover:text-stone-700">
                      {isSelected ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900">{sess.task_type}</span>
                        {sess.is_undone && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-600">
                            Reverted (Undone)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 font-mono">
                        {sess.workspace_path} • {new Date(sess.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      <span className="font-bold text-emerald-800">{sess.executed_count} files organized</span>
                      <span className="block text-[11px] text-stone-400">
                        {sess.skipped_count} skipped, {sess.failed_count} failed
                      </span>
                    </div>

                    {!sess.is_undone && sess.executed_count > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUndo(sess.session_id);
                        }}
                        disabled={isUndoing}
                        className="sloth-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>{isUndoing ? 'Reverting...' : 'Undo'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Journal entries */}
                {isSelected && (
                  <div className="p-5 bg-stone-50/80 border-t border-stone-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                      Operations Journal ({journalEntries.length} recorded)
                    </h4>

                    {loadingJournal ? (
                      <div className="text-xs text-stone-500 py-3">Loading journal entries...</div>
                    ) : journalEntries.length === 0 ? (
                      <div className="text-xs text-stone-400 py-2">No file operations recorded for this session.</div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {journalEntries.map((j) => (
                          <div
                            key={j.id}
                            className="p-3 rounded-lg border border-stone-200 bg-white text-xs flex items-center justify-between gap-3 font-mono"
                          >
                            <div className="truncate max-w-xs text-stone-600" title={j.source_path}>
                              {j.source_path.split('\\').pop()?.split('/').pop()}
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <div className="truncate max-w-xs font-semibold text-emerald-900" title={j.destination_path}>
                              {j.destination_path.split('\\').pop()?.split('/').pop()}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              j.is_undone ? 'bg-stone-200 text-stone-600' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {j.is_undone ? 'Reverted' : 'Moved'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
