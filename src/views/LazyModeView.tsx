import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Copy,
  FolderSync,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Undo2,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { SlothMascot } from '../components/SlothMascot';
import * as api from '../api';
import { ActionPlan, DocumentSummary, ExecutionResult, ScanResult } from '../types';

interface LazyModeViewProps {
  currentPath: string;
  onRefreshHistory: () => void;
  onScanUpdated: (res: ScanResult) => void;
}

export const LazyModeView: React.FC<LazyModeViewProps> = ({
  currentPath,
  onRefreshHistory,
  onScanUpdated,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [lazyResult, setLazyResult] = useState<{
    scan: ScanResult;
    action_plan: ActionPlan;
    summaries: DocumentSummary[];
    duplicates: any[];
  } | null>(null);

  const [selectedActionIds, setSelectedActionIds] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoDone, setUndoDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { label: 'Folder Scanning', desc: 'Indexing files and measuring disk space' },
    { label: 'Duplicate Detection', desc: 'Computing SHA-256 hashes to find identical copies' },
    { label: 'Local AI Categorization', desc: 'Qwen 2.5 3B organizing files into clean categories' },
    { label: 'Executive Document Summaries', desc: 'Extracting key takeaways & deadlines locally' },
    { label: 'Consolidated Action Plan', desc: 'Awaiting your approval before touching disk' },
  ];

  const handleStartLazyMode = async () => {
    setIsRunning(true);
    setCurrentStep(1);
    setError(null);
    setLazyResult(null);
    setExecutionResult(null);
    setUndoDone(false);

    try {
      // Simulate visual progression through stages
      const timer1 = setTimeout(() => setCurrentStep(2), 700);
      const timer2 = setTimeout(() => setCurrentStep(3), 1500);

      const res = await api.runLazyMode(currentPath, true, 2);

      clearTimeout(timer1);
      clearTimeout(timer2);
      setCurrentStep(4);
      setTimeout(() => setCurrentStep(5), 600);

      setLazyResult(res);
      onScanUpdated(res.scan);

      // Pre-select all proposed actions
      const allIds = new Set(res.action_plan.actions.map((a) => a.action_id));
      setSelectedActionIds(allIds);
    } catch (e: any) {
      setError(e.message || 'Lazy Mode failed');
      setCurrentStep(0);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleAction = (id: string) => {
    const next = new Set(selectedActionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedActionIds(next);
  };

  const handleExecute = async () => {
    if (!lazyResult) return;
    setIsExecuting(true);
    try {
      const approved = Array.from(selectedActionIds);
      const res = await api.executePlan(lazyResult.action_plan, approved, 'Lazy Mode');
      setExecutionResult(res);
      onRefreshHistory();
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
      setUndoDone(true);
      onRefreshHistory();
    } catch (e: any) {
      alert(`Undo failed: ${e.message}`);
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="sloth-card p-8 bg-gradient-to-r from-emerald-900 via-teal-900 to-forest-900 text-white border-none shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The One-Click Sloth Flow</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold font-brand text-white">
            Lazy Mode Declutter
          </h2>

          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed">
            Click one button. LazyDesk scans <span className="font-mono text-emerald-200 font-semibold">{currentPath}</span>, finds duplicates, runs local AI categorization, and summarizes top documents into a consolidated plan.
          </p>

          <div className="pt-2">
            <button
              onClick={handleStartLazyMode}
              disabled={isRunning}
              className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-emerald-900" />
              <span>{isRunning ? 'Sloth is Automating Everything...' : 'Run Full Lazy Declutter'}</span>
            </button>
          </div>
        </div>

        <div className="absolute right-4 bottom-[-10px] md:right-10 md:bottom-2 opacity-95 pointer-events-none">
          <SlothMascot size={150} mood={isRunning ? 'thinking' : 'relaxed'} />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Timeline */}
      {currentStep > 0 && (
        <div className="sloth-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Automated Pipeline Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {steps.map((st, i) => {
              const stepNum = i + 1;
              const isPast = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div
                  key={stepNum}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isPast
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : isCurrent
                      ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm ring-2 ring-teal-500/20'
                      : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-stone-300 text-stone-800 flex items-center justify-center text-[10px]">
                        {stepNum}
                      </span>
                    )}
                    <span>{st.label}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consolidated Report Output */}
      {lazyResult && !executionResult && (
        <div className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sloth-card p-5 space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase">Files Analyzed</span>
              <div className="text-2xl font-extrabold text-stone-900 font-brand">
                {lazyResult.scan.total_files} files
              </div>
              <p className="text-xs text-stone-500">Across {lazyResult.scan.total_folders} subfolders</p>
            </div>

            <div className="sloth-card p-5 space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase">Duplicates Detected</span>
              <div className="text-2xl font-extrabold text-amber-700 font-brand">
                {lazyResult.duplicates.length} duplicate sets
              </div>
              <p className="text-xs text-stone-500">SHA-256 hashed locally</p>
            </div>

            <div className="sloth-card p-5 space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase">Documents Summarized</span>
              <div className="text-2xl font-extrabold text-emerald-800 font-brand">
                {lazyResult.summaries.length} executive summaries
              </div>
              <p className="text-xs text-stone-500">Key takeaways ready</p>
            </div>
          </div>

          {/* Document Summaries Preview Carousel */}
          {lazyResult.summaries.length > 0 && (
            <div className="sloth-card p-6 space-y-4">
              <h3 className="text-base font-bold text-stone-900 font-brand flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>Executive Document Takeaways</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lazyResult.summaries.map((sum, i) => (
                  <div key={i} className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2 text-xs">
                    <div className="font-bold text-emerald-900 truncate font-mono">{sum.file_name}</div>
                    <p className="text-stone-700 line-clamp-3">{sum.summary}</p>
                    {sum.key_takeaways.length > 0 && (
                      <div className="pt-1">
                        <span className="font-semibold text-[11px] text-stone-500 uppercase">Top takeaway:</span>
                        <p className="text-stone-800 italic mt-0.5">&ldquo;{sum.key_takeaways[0]}&rdquo;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Approval Card */}
          <div className="sloth-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-brand">
                  Proposed File Operations ({lazyResult.action_plan.actions.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Select which operations to approve. No files are moved without explicit consent.
                </p>
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting || selectedActionIds.size === 0}
                className="sloth-btn-primary text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isExecuting ? 'Applying Operations...' : `Approve & Execute (${selectedActionIds.size})`}</span>
              </button>
            </div>

            {/* Safety badge */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Safety verified: All operations are strictly contained within the workspace root and logged for 1-click Undo.
              </span>
            </div>

            {/* List of actions */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lazyResult.action_plan.actions.map((act) => {
                const isSelected = selectedActionIds.has(act.action_id);
                const srcName = act.source_path.split('\\').pop()?.split('/').pop();
                const destName = act.destination_path.split('\\').pop()?.split('/').pop();

                return (
                  <div
                    key={act.action_id}
                    onClick={() => toggleAction(act.action_id)}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-white border-stone-200 hover:bg-stone-50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-300 shrink-0" />
                      )}
                      <div>
                        <div className="font-mono font-medium text-stone-800 truncate max-w-xs">{srcName}</div>
                        <div className="text-[11px] text-stone-500">{act.explanation}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="badge-category badge-documents text-[10px]">
                        {act.proposed_category}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-mono font-semibold text-emerald-900 text-xs truncate max-w-[150px]">
                        {destName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Execution Result Banner */}
      {executionResult && (
        <div className="sloth-card p-8 space-y-4 bg-emerald-50/70 border-emerald-300 text-center">
          <SlothMascot size={80} mood="celebrating" className="mx-auto" />
          <h3 className="text-xl font-bold text-emerald-950 font-brand">
            Lazy Mode Declutter Completed Successfully!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            {executionResult.succeeded_count} files organized into clean category folders. Your workspace is now tidy and effortless.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            {!undoDone ? (
              <button
                onClick={handleUndo}
                disabled={isUndoing}
                className="sloth-btn-secondary text-xs flex items-center gap-1.5"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>{isUndoing ? 'Undoing...' : 'Undo All Changes'}</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg">
                All changes have been safely reverted.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
