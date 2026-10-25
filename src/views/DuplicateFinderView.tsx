import React, { useState } from 'react';
import {
  Copy,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DuplicateGroup } from '../types';

interface DuplicateFinderViewProps {
  duplicates: DuplicateGroup[];
  currentPath: string;
}

export const DuplicateFinderView: React.FC<DuplicateFinderViewProps> = ({
  duplicates,
  currentPath,
}) => {
  const [selectedGroupHash, setSelectedGroupHash] = useState<string | null>(
    duplicates.length > 0 ? duplicates[0].file_hash : null
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalWasted = duplicates.reduce((acc, d) => acc + d.wasted_bytes, 0);

  const activeGroup = duplicates.find((d) => d.file_hash === selectedGroupHash);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="sloth-card p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-brand flex items-center gap-2">
              <Copy className="w-5 h-5 text-emerald-800" />
              <span>Exact Duplicate Detector</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Identifies identical byte-for-byte duplicates using local SHA-256 hashes.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2 shrink-0">
            <HardDrive className="w-4 h-4 text-amber-600" />
            <div>
              <span className="font-bold">{formatBytes(totalWasted)}</span>
              <span className="text-[11px] block text-amber-700">Wasted across {duplicates.length} sets</span>
            </div>
          </div>
        </div>

        {/* Safety Guarantee */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Safety First:</strong> LazyDesk detects duplicates deterministically and never deletes files automatically. You retain full control over file retention.
          </span>
        </div>
      </div>

      {duplicates.length === 0 ? (
        <div className="sloth-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 font-brand">No Duplicate Files Detected</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            All scanned files in <code className="font-mono text-stone-700">{currentPath}</code> have unique file hashes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Duplicate Sets */}
          <div className="sloth-card p-4 space-y-3 lg:col-span-1 max-h-[500px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
              Duplicate Groups ({duplicates.length})
            </h3>
            <div className="space-y-2">
              {duplicates.map((group, idx) => {
                const sampleName = group.file_paths[0].split('\\').pop()?.split('/').pop() || 'File';
                const isSelected = group.file_hash === selectedGroupHash;
                return (
                  <button
                    key={group.file_hash}
                    onClick={() => setSelectedGroupHash(group.file_hash)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm'
                        : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="truncate max-w-[150px] font-mono">{sampleName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                        {group.count} copies
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                      <span>{formatBytes(group.file_size_bytes)} each</span>
                      <span className="text-amber-700 font-medium">Reclaim {formatBytes(group.wasted_bytes)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duplicate Detail View */}
          <div className="sloth-card p-6 space-y-6 lg:col-span-2">
            {activeGroup ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-brand">
                      Duplicate Cluster Inspection
                    </h3>
                    <p className="text-xs text-stone-500 font-mono mt-0.5 truncate max-w-md">
                      SHA-256: {activeGroup.file_hash}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      {activeGroup.count} Identical Files
                    </span>
                  </div>
                </div>

                {/* Copies list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    File Locations:
                  </h4>
                  <div className="space-y-2">
                    {activeGroup.file_paths.map((p, i) => (
                      <div
                        key={p}
                        className="p-3 rounded-lg border border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-mono text-stone-800 truncate" title={p}>
                            {p}
                          </span>
                        </div>
                        {i === 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                            Original / First Found
                          </span>
                        )}
                        {i > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            Redundant Copy
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe Guidance */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <h4 className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>Recommended Consolidation Strategy</span>
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    Keep copy #1 in its logical folder and review redundant copies in the Smart Organizer view to bundle them into an Archives folder or rename them distinctly.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-stone-400">
                Select a duplicate group to inspect paths and file sizes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
