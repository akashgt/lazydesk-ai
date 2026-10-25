import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  DollarSign,
  WifiOff,
  Code2,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { OllamaStatus } from '../types';
import * as api from '../api';

interface WhyOpenAiViewProps {
  ollamaStatus: OllamaStatus | null;
  onRefreshHealth: () => void;
}

export const WhyOpenAiView: React.FC<WhyOpenAiViewProps> = ({
  ollamaStatus,
  onRefreshHealth,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(
    ollamaStatus?.configured_model || 'gemma2:2b'
  );
  const [isSwitching, setIsSwitching] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleSwitchModel = async (newModel: string) => {
    setSelectedModel(newModel);
    setIsSwitching(true);
    try {
      await api.selectModel(newModel);
      onRefreshHealth();
    } catch (e: any) {
      alert(`Failed to switch model: ${e.message}`);
    } finally {
      setIsSwitching(false);
    }
  };

  const handlePingLatency = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await api.fetchHealth();
      const end = performance.now();
      setPingLatency(Math.round(end - start));
    } catch {
      setPingLatency(null);
    } finally {
      setIsPinging(false);
    }
  };

  const copyPullCommand = () => {
    navigator.clipboard.writeText('ollama pull gemma2:2b');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const pillars = [
    {
      icon: <Lock className="w-6 h-6 text-emerald-700" />,
      title: '1. Privacy by Architecture',
      desc: 'All file reading, SHA-256 hashing, document extraction, and inference occur strictly on your machine. No documents, filenames, or summaries are transmitted to third parties or cloud backends.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-teal-700" />,
      title: '2. User Sovereignty & Model Choice',
      desc: 'You are never locked into a single proprietary vendor. You can switch between Qwen, Llama, Mistral, or specialized coding/writing models without touching proprietary APIs.',
    },
    {
      icon: <DollarSign className="w-6 h-6 text-amber-700" />,
      title: '3. Predictable Zero-Per-Token Cost',
      desc: 'Local open-weight inference does not incur recurring token costs, API subscriptions, or rate limit penalties. (Only your standard computer hardware and electricity are used).',
    },
    {
      icon: <WifiOff className="w-6 h-6 text-blue-700" />,
      title: '4. Genuine Offline Potential',
      desc: 'Once Ollama and the model weights are downloaded, LazyDesk can organize and summarize your messy workspace completely off the grid—on planes, in remote locations, or during network outages.',
    },
    {
      icon: <Code2 className="w-6 h-6 text-purple-700" />,
      title: '5. Auditable Transparency',
      desc: 'Open innovation means you can inspect the prompt formatting, review the deterministic safety checks, verify that prompt injection cannot escape workspace paths, and modify the application freely.',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="sloth-card p-8 bg-gradient-to-r from-emerald-900 to-forest-800 text-white space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-400/30">
          <span>The Philosophy of Open Innovation</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-brand text-white">
          Why Open AI Matters
        </h2>
        <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
          At LazyDesk AI, open-source AI is our core security boundary, not an afterthought. Here is why local open-weight intelligence delivers a superior, privacy-first desktop experience.
        </p>
      </div>

      {/* 5 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((p, i) => (
          <div key={i} className="sloth-card p-6 space-y-3 bg-white">
            <div className="p-3 w-fit rounded-xl bg-stone-100">{p.icon}</div>
            <h3 className="text-base font-bold text-stone-900 font-brand">{p.title}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">{p.desc}</p>
          </div>
        ))}

        {/* License Distinction Note */}
        <div className="sloth-card p-6 space-y-3 bg-stone-50 border-stone-300 md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Distinct Open-Source & Model Licensing</span>
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            LazyDesk AI application code is published under the permissive <strong>MIT License</strong>. The default open-weight model weights (<code className="font-mono text-emerald-900 bg-stone-200 px-1 py-0.5 rounded font-semibold">gemma2:2b</code>) are released by Google under the permissive <strong>Gemma Terms of Use</strong>, granting free commercial and research redistribution under Google's Responsible Generative AI Guidelines. Alternate supported models like Qwen 2.5 operate under the Apache 2.0 license.
          </p>
        </div>

        {/* Render Deployment Partner Card */}
        <div className="sloth-card p-6 space-y-3 bg-gradient-to-br from-stone-50 to-emerald-50/50 border-emerald-300 md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-emerald-700" />
            <span>Cloud Deployment with Render (Hosted Demo Architecture)</span>
          </h4>
          <p className="text-xs text-stone-700 leading-relaxed">
            LazyDesk AI is configured for instant zero-configuration deployment on <strong>Render</strong> using our official Blueprint (<code className="font-mono text-emerald-900 bg-stone-200 px-1 py-0.5 rounded">render.yaml</code>) and multi-stage <code className="font-mono text-emerald-900 bg-stone-200 px-1 py-0.5 rounded">Dockerfile</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
              <span className="font-bold text-emerald-900 block">Render Blueprint</span>
              <span className="text-[11px] text-stone-500">Auto-provisions unified web service & health checks</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
              <span className="font-bold text-emerald-900 block">Sandboxed Demo Mode</span>
              <span className="text-[11px] text-stone-500">Restricts hosted sessions to synthetic sample files</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
              <span className="font-bold text-emerald-900 block">Health Check Monitor</span>
              <span className="text-[11px] text-stone-500">Zero-downtime monitoring at <code className="font-mono">/api/health</code></span>
            </div>
          </div>
        </div>
      </div>

      {/* Live AI Status & Configuration Panel */}
      <div className="sloth-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-brand flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-800" />
              <span>Local AI Runtime Diagnostics</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Live connection status with your local Ollama daemon (<code className="font-mono text-emerald-900">{ollamaStatus?.endpoint_url || 'http://localhost:11434'}</code>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePingLatency}
              disabled={isPinging}
              className="sloth-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{pingLatency !== null ? `${pingLatency} ms Ping` : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-stone-500 uppercase text-[10px] font-bold">Ollama Reachability</span>
            <div className="flex items-center gap-2 font-bold text-sm">
              {ollamaStatus?.is_reachable ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-900">Online (Connected)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-900">Unreachable</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-stone-500 uppercase text-[10px] font-bold">Active Model</span>
            <div className="font-mono font-bold text-sm text-stone-900 truncate">
              {ollamaStatus?.configured_model || 'gemma2:2b'}
            </div>
            <span className="text-[11px] text-stone-500">
              {ollamaStatus?.model_available ? 'Weights Verified Locally' : 'Not Pulled'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-stone-500 uppercase text-[10px] font-bold">Privacy Audit</span>
            <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-900">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Zero Cloud APIs</span>
            </div>
            <span className="text-[11px] text-stone-500">No telemetry enabled</span>
          </div>
        </div>

        {/* Model Switcher */}
        {ollamaStatus?.available_models && ollamaStatus.available_models.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700">Switch Locally Installed Model:</label>
            <div className="flex flex-wrap gap-2">
              {ollamaStatus.available_models.map((m) => (
                <button
                  key={m}
                  onClick={() => handleSwitchModel(m)}
                  disabled={isSwitching}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    selectedModel === m
                      ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Setup instructions if offline or model missing */}
        {(!ollamaStatus?.is_reachable || !ollamaStatus?.model_available) && (
          <div className="p-5 rounded-xl bg-stone-900 text-white space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-stone-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-4 h-4" />
                <span>Quick Setup Instructions</span>
              </span>
              <button
                onClick={copyPullCommand}
                className="flex items-center gap-1 text-[11px] hover:text-white"
              >
                {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-stone-300 text-[11px] font-sans">
              To run LazyDesk locally with open-weight inference, install Ollama and pull the recommended lightweight model:
            </p>

            <pre className="p-3 rounded-lg bg-stone-950 text-emerald-400 overflow-x-auto">
              ollama serve{'\n'}
              ollama pull gemma2:2b
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
