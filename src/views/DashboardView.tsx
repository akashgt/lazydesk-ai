import React from 'react';
import { SlothMascot } from '../components/SlothMascot';
import {
  FolderSync,
  FileText,
  Copy,
  Clock,
  Sparkles,
  ArrowRight,
  HardDrive,
  Layers,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { ScanResult, SessionRecord, OllamaStatus } from '../types';

interface DashboardViewProps {
  currentPath: string;
  scanResult: ScanResult | null;
  history: SessionRecord[];
  ollamaStatus: OllamaStatus | null;
  onNavigate: (tab: string) => void;
  onStartLazyMode: () => void;
  isDemoMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentPath,
  scanResult,
  history,
  ollamaStatus,
  onNavigate,
  onStartLazyMode,
  isDemoMode,
}) => {
  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalFiles = scanResult ? scanResult.total_files : 0;
  const totalSize = scanResult ? formatBytes(scanResult.total_size_bytes) : '0 MB';
  const duplicateGroups = scanResult ? scanResult.duplicates.length : 0;
  const wastedBytes = scanResult
    ? formatBytes(scanResult.duplicates.reduce((acc, d) => acc + d.wasted_bytes, 0))
    : '0 B';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden sloth-card bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 md:p-10 shadow-xl border-none">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/50 text-emerald-200 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            <span>Hacktoberfest Week 3 Challenge</span>
            <span>•</span>
            <span>Slow and Steady</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Your digital workspace, <br className="hidden sm:inline" />
            <span className="text-emerald-300">minus the effort.</span>
          </h1>

          <p className="text-emerald-100/90 text-base md:text-lg leading-relaxed">
            Stay lazy. Let your local open-weight AI (<span className="font-mono text-emerald-200 font-semibold">{ollamaStatus?.configured_model || 'gemma2:2b'}</span>) sort the clutter, detect duplicates, and summarize documents with complete privacy.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartLazyMode}
              className="px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-sm md:text-base inline-flex items-center gap-2.5 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5 text-emerald-900" />
              <span>Start Lazy Mode</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('organizer')}
              className="px-5 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/90 text-white font-semibold text-sm inline-flex items-center gap-2 border border-emerald-600/40 transition-colors"
            >
              <FolderSync className="w-4 h-4" />
              <span>Custom Scan</span>
            </button>
          </div>
        </div>

        {/* Mascot in Hero */}
        <div className="absolute right-4 bottom-[-10px] md:right-10 md:bottom-2 opacity-95 pointer-events-none">
          <SlothMascot size={170} mood="relaxed" />
        </div>
      </div>

      {/* Demo Mode Notice Banner if enabled */}
      {isDemoMode && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start justify-between gap-4 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Demo Mode Active (Safe Exploration)</h4>
              <p className="text-xs text-amber-800/90">
                You are currently exploring a safe simulated workspace (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">{currentPath}</code>). No personal files will be touched.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('organizer')}
            className="text-xs font-semibold text-amber-900 hover:underline shrink-0"
          >
            Scan sample folder &rarr;
          </button>
        </div>
      )}

      {/* Workspace Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sloth-card p-5 space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Files Scanned</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-brand">
            {totalFiles}
          </div>
          <p className="text-xs text-stone-500">
            {scanResult ? `${Object.keys(scanResult.category_counts).length} categories detected` : 'No folder scanned yet'}
          </p>
        </div>

        <div className="sloth-card p-5 space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Storage Analyzed</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-brand">
            {totalSize}
          </div>
          <p className="text-xs text-stone-500">
            {scanResult?.largest_files.length ? `Largest: ${scanResult.largest_files[0].name}` : 'Calculated locally'}
          </p>
        </div>

        <div className="sloth-card p-5 space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Duplicate Sets</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-brand">
            {duplicateGroups}
          </div>
          <p className="text-xs text-amber-700 font-medium">
            {duplicateGroups > 0 ? `Can reclaim ~${wastedBytes}` : 'No exact duplicates found'}
          </p>
        </div>

        <div className="sloth-card p-5 space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">AI Model Status</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-brand truncate">
            {ollamaStatus?.configured_model || 'gemma2:2b'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% On-Device Inference</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-900 font-brand">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('organizer')}
            className="sloth-card p-6 text-left hover:border-emerald-600/40 group transition-all"
          >
            <div className="p-3 w-fit rounded-xl bg-emerald-100 text-emerald-800 mb-4 group-hover:scale-110 transition-transform">
              <FolderSync className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
              Smart File Organizer
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Scan cluttered directories and let local AI suggest clean filenames and logical category folders.
            </p>
          </button>

          <button
            onClick={() => onNavigate('summarizer')}
            className="sloth-card p-6 text-left hover:border-emerald-600/40 group transition-all"
          >
            <div className="p-3 w-fit rounded-xl bg-teal-100 text-teal-800 mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
              Document Summarizer
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Extract PDFs, DOCX, and text locally. Get 5 key takeaways, deadlines, action items, and tags.
            </p>
          </button>

          <button
            onClick={() => onNavigate('duplicates')}
            className="sloth-card p-6 text-left hover:border-emerald-600/40 group transition-all"
          >
            <div className="p-3 w-fit rounded-xl bg-amber-100 text-amber-800 mb-4 group-hover:scale-110 transition-transform">
              <Copy className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
              Duplicate Detector
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Calculate exact SHA-256 hashes without cloud uploads. Safely group duplicates and reclaim disk space.
            </p>
          </button>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="sloth-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-800" />
            <h3 className="text-base font-bold text-stone-900 font-brand">Recent Activity & Safety Journal</h3>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            View all sessions &rarr;
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-stone-400 space-y-2">
            <p className="text-sm">No activity recorded yet.</p>
            <p className="text-xs">Your file changes, undo checkpoints, and declutter sessions will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {history.slice(0, 4).map((sess) => (
              <div key={sess.session_id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800">{sess.task_type}</span>
                    {sess.is_undone && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-200 text-stone-600">
                        Reverted (Undone)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 truncate max-w-md">
                    {sess.workspace_path} • {new Date(sess.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-semibold text-emerald-800">
                    {sess.executed_count} files organized
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
