import React, { useState } from 'react';
import {
  FolderSync,
  Search,
  CheckSquare,
  Square,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  AlertCircle,
  FileCheck2,
  FolderOpen,
  CheckCircle2,
  Undo2,
} from 'lucide-react';
import { ScanResult, FileSuggestion, ActionPlan, ExecutionResult } from '../types';
import * as api from '../api';
import { SlothMascot } from '../components/SlothMascot';

interface ScannerOrganizerViewProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  scanResult: ScanResult | null;
  onScanComplete: (res: ScanResult) => void;
  pickerSuggestions: Array<{ name: string; path: string }>;
  onRefreshHistory: () => void;
}

export const ScannerOrganizerView: React.FC<ScannerOrganizerViewProps> = ({
  currentPath,
  onPathChange,
  scanResult,
  onScanComplete,
  pickerSuggestions,
  onRefreshHistory,
}) => {
  const [inputPath, setInputPath] = useState(currentPath);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // AI Categorization states
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [suggestions, setSuggestions] = useState<FileSuggestion[]>([]);
  const [selectedActionIds, setSelectedActionIds] = useState<Set<string>>(new Set());

  // Review & Execute states
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Undo state
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoSuccess, setUndoSuccess] = useState(false);

  const handleScan = async (targetPath?: string) => {
    const pathToScan = targetPath || inputPath;
    if (!pathToScan.trim()) return;

    setIsScanning(true);
    setScanError(null);
    setSuggestions([]);
    setActionPlan(null);
    setExecutionResult(null);

    try {
      const res = await api.scanFolder(pathToScan);
      onScanComplete(res);
      onPathChange(pathToScan);
    } catch (e: any) {
      setScanError(e.message || 'Folder scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAskAI = async () => {
    if (!scanResult || scanResult.files.length === 0) return;
    setIsCategorizing(true);
    setScanError(null);

    try {
      const res = await api.categorizeFiles(currentPath, scanResult.files);
      setSuggestions(res);

      // Pre-select all suggestions
      const allIds = new Set(res.map((_, i) => `act_${i + 1}`));
      setSelectedActionIds(allIds);

      // Build dry run plan
      const plan = await api.generateActionPlan(currentPath, res);
      setActionPlan(plan);
    } catch (e: any) {
      setScanError(e.message || 'AI categorization failed');
    } finally {
      setIsCategorizing(false);
    }
  };

  const toggleSelectAction = (id: string) => {
    const next = new Set(selectedActionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedActionIds(next);
  };

  const selectAll = () => {
    if (!actionPlan) return;
    if (selectedActionIds.size === actionPlan.actions.length) {
      setSelectedActionIds(new Set());
    } else {
      setSelectedActionIds(new Set(actionPlan.actions.map((a) => a.action_id)));
    }
  };

  const handleExecuteCleanup = async () => {
    if (!actionPlan) return;
    setIsExecuting(true);
    try {
      const approvedList = Array.from(selectedActionIds);
      const res = await api.executePlan(actionPlan, approvedList, 'Smart Organizer');
      setExecutionResult(res);
      setShowReviewModal(false);
      onRefreshHistory();
      // Re-scan folder to show updated state
      handleScan(currentPath);
    } catch (e: any) {
      alert(`Execution failed: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleUndo = async () => {
    if (!executionResult) return;
    setIsUndoing(true);
    try {
      await api.undoSession(executionResult.session_id);
      setUndoSuccess(true);
      onRefreshHistory();
      // Re-scan
      handleScan(currentPath);
    } catch (e: any) {
      alert(`Undo failed: ${e.message}`);
    } finally {
      setIsUndoing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Folder Selector */}
      <div className="sloth-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-brand flex items-center gap-2">
              <FolderSync className="w-5 h-5 text-emerald-800" />
              <span>Smart Folder Scanner & Organizer</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select any local directory. Scan its contents, preview AI recommendations, and approve file moves safely.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScan()}
              disabled={isScanning || !inputPath.trim()}
              className="sloth-btn-primary text-xs"
            >
              <Search className="w-4 h-4" />
              <span>{isScanning ? 'Scanning Directory...' : 'Scan Directory'}</span>
            </button>
          </div>
        </div>

        {/* Path Input Box */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="e.g. C:\Users\Username\Downloads"
              className="w-full px-4 py-2.5 pl-10 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-xs font-mono bg-stone-50 text-stone-900"
            />
            <FolderOpen className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>

          {/* Quick Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
            <span className="font-semibold text-stone-500 text-[11px]">Quick Paths:</span>
            {pickerSuggestions.map((p) => (
              <button
                key={p.path}
                onClick={() => {
                  setInputPath(p.path);
                  handleScan(p.path);
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                  inputPath === p.path
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {scanError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{scanError}</span>
          </div>
        )}
      </div>

      {/* Scan Results Breakdown */}
      {scanResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Files</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{scanResult.total_files}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Total Space</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatBytes(scanResult.total_size_bytes)}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Subfolders</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{scanResult.total_folders}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Duplicate Sets</span>
              <div className="text-xl font-bold text-amber-700 mt-1">{scanResult.duplicates.length}</div>
            </div>
          </div>

          {/* AI Organization Action Trigger */}
          <div className="sloth-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border-emerald-200/70">
            <div className="flex items-center gap-4">
              <SlothMascot size={52} mood={isCategorizing ? 'thinking' : 'relaxed'} />
              <div>
                <h3 className="font-bold text-stone-900 text-sm md:text-base font-brand">
                  Ready for AI Organization Suggestions?
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  The local open-weight model will analyze filenames and document text to propose tidy categories.
                </p>
              </div>
            </div>

            <button
              onClick={handleAskAI}
              disabled={isCategorizing || scanResult.files.length === 0}
              className="sloth-btn-primary shrink-0 text-xs md:text-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{isCategorizing ? 'Sloth is Thinking (Local AI)...' : 'Generate AI Suggestions'}</span>
            </button>
          </div>

          {/* AI Suggestions Table */}
          {suggestions.length > 0 && actionPlan && (
            <div className="sloth-card overflow-hidden">
              <div className="p-4 md:p-5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                  >
                    {selectedActionIds.size === actionPlan.actions.length ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400" />
                    )}
                    <span>
                      {selectedActionIds.size === actionPlan.actions.length
                        ? 'Deselect All'
                        : `Select All (${actionPlan.actions.length})`}
                    </span>
                  </button>

                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs text-stone-600 font-medium">
                    {selectedActionIds.size} of {actionPlan.actions.length} approved
                  </span>
                </div>

                <button
                  onClick={() => setShowReviewModal(true)}
                  disabled={selectedActionIds.size === 0}
                  className="sloth-btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Review & Execute ({selectedActionIds.size})</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/70 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 w-10">Select</th>
                      <th className="py-3 px-4">Original File</th>
                      <th className="py-3 px-4">Proposed Filename</th>
                      <th className="py-3 px-4">Proposed Category</th>
                      <th className="py-3 px-4">AI Rationale</th>
                      <th className="py-3 px-4 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {actionPlan.actions.map((act) => {
                      const isSelected = selectedActionIds.has(act.action_id);
                      return (
                        <tr
                          key={act.action_id}
                          className={`hover:bg-emerald-50/40 transition-colors ${
                            isSelected ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleSelectAction(act.action_id)}
                              className="text-stone-400 hover:text-emerald-700"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-emerald-700" />
                              ) : (
                                <Square className="w-4 h-4 text-stone-300" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-stone-800 max-w-[200px] truncate">
                            {act.source_path.split('\\').pop()?.split('/').pop()}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-emerald-900 max-w-[220px] truncate">
                            {act.destination_path.split('\\').pop()?.split('/').pop()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="badge-category badge-documents">
                              {act.proposed_category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-600 max-w-xs truncate" title={act.explanation}>
                            {act.explanation}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                              {Math.round((act.is_safe ? 0.9 : 0.5) * 100)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Execution Result Banner */}
          {executionResult && (
            <div className="sloth-card p-6 space-y-4 bg-emerald-50/60 border-emerald-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 font-brand">
                      Cleanup Complete!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Successfully organized {executionResult.succeeded_count} files into clean category folders.
                    </p>
                  </div>
                </div>

                {!undoSuccess ? (
                  <button
                    onClick={handleUndo}
                    disabled={isUndoing}
                    className="sloth-btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{isUndoing ? 'Undoing...' : 'Undo All Changes'}</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                    Reverted to original state!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review & Approval Modal */}
      {showReviewModal && actionPlan && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="sloth-card max-w-2xl w-full p-6 space-y-5 bg-white shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-brand flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>Review Proposed Operations</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Confirm operations before LazyDesk moves or renames any files.
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Safety Guarantees Checklist */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1.5 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Zero File Deletions: Files are only moved into category folders.</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Boundary Protection: Paths cannot escape current folder.</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Collision Safe: Existing files will not be overwritten.</span>
              </div>
            </div>

            {/* List of files to be moved */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-60 text-xs">
              {actionPlan.actions
                .filter((a) => selectedActionIds.has(a.action_id))
                .map((a) => (
                  <div
                    key={a.action_id}
                    className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60 flex items-center justify-between gap-2"
                  >
                    <div className="truncate max-w-xs font-mono text-stone-600">
                      {a.source_path.split('\\').pop()?.split('/').pop()}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <div className="truncate max-w-xs font-mono font-semibold text-emerald-900">
                      {a.proposed_category}/{a.destination_path.split('\\').pop()?.split('/').pop()}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowReviewModal(false)}
                className="sloth-btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCleanup}
                disabled={isExecuting}
                className="sloth-btn-primary text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isExecuting ? 'Applying Changes...' : `Approve & Execute (${selectedActionIds.size})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
