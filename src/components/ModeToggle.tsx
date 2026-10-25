import React from 'react';
import { Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';

interface ModeToggleProps {
  isDemoMode: boolean;
  onToggle: (enabled: boolean) => void;
  onResetDemo?: () => void;
  isResetting?: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  isDemoMode,
  onToggle,
  onResetDemo,
  isResetting = false,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Toggle Button */}
      <div className="inline-flex items-center p-1 rounded-xl bg-stone-200/80 border border-stone-300/60 shadow-inner">
        <button
          onClick={() => onToggle(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isDemoMode
              ? 'bg-amber-100 text-amber-900 shadow-sm border border-amber-300'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo Mode</span>
        </button>

        <button
          onClick={() => onToggle(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !isDemoMode
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Live Mode</span>
        </button>
      </div>

      {/* Reset Demo Workspace button if in demo mode */}
      {isDemoMode && onResetDemo && (
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-1 text-xs text-amber-800 hover:text-amber-950 font-medium px-2 py-1 rounded-md hover:bg-amber-100/60 transition-colors"
          title="Reset sample fictional files"
        >
          <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Sample Files</span>
        </button>
      )}
    </div>
  );
};
