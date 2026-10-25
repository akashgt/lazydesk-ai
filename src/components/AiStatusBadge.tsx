import React from 'react';
import { OllamaStatus } from '../types';
import { Cpu, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface AiStatusBadgeProps {
  status: OllamaStatus | null;
  onOpenSettings?: () => void;
}

export const AiStatusBadge: React.FC<AiStatusBadgeProps> = ({ status, onOpenSettings }) => {
  if (!status) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
        Checking Ollama...
      </div>
    );
  }

  const isHealthy = status.is_reachable && status.model_available;
  const isMissingModel = status.is_reachable && !status.model_available;

  return (
    <button
      onClick={onOpenSettings}
      className={`group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
        isHealthy
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
          : isMissingModel
          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
      }`}
      title={
        isHealthy
          ? `Local AI Online: ${status.configured_model}`
          : isMissingModel
          ? `Model ${status.configured_model} missing. Click for instructions.`
          : 'Ollama is offline. Click for setup guide.'
      }
    >
      <Cpu className="w-3.5 h-3.5" />

      <span className="font-mono font-semibold">{status.configured_model}</span>

      {isHealthy && (
        <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-700">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Local (Ready)</span>
        </span>
      )}

      {isMissingModel && (
        <span className="inline-flex items-center gap-1 text-[11px] font-normal text-amber-700">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Model Missing</span>
        </span>
      )}

      {!status.is_reachable && (
        <span className="inline-flex items-center gap-1 text-[11px] font-normal text-rose-700">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Ollama Offline</span>
        </span>
      )}
    </button>
  );
};
