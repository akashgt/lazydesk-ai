import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Calendar,
  CheckSquare,
  Tag,
  Copy,
  Download,
  AlertCircle,
  FileCheck,
  FileCode,
  Check,
} from 'lucide-react';
import { DocumentSummary, FileInfo } from '../types';
import * as api from '../api';
import { SlothMascot } from '../components/SlothMascot';

interface SummarizerViewProps {
  availableFiles: FileInfo[];
  currentPath: string;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  availableFiles,
  currentPath,
}) => {
  const supportedFiles = availableFiles.filter((f) => f.can_extract_text);
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    supportedFiles.length > 0 ? supportedFiles[0].path : ''
  );
  const [mode, setMode] = useState<'short' | 'standard' | 'detailed'>('standard');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!selectedFilePath) return;
    setIsSummarizing(true);
    setError(null);
    setSummary(null);

    try {
      const res = await api.summarizeDocument(selectedFilePath, mode);
      setSummary(res);
    } catch (e: any) {
      setError(e.message || 'Summarization failed');
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyMarkdown = () => {
    if (!summary) return;
    const md = `# Summary: ${summary.file_name}
Model: ${summary.model_used}
Mode: ${summary.summary_mode}

## Executive Summary
${summary.summary}

## Key Takeaways
${summary.key_takeaways.map((t) => `- ${t}`).join('\n')}

## Important Dates & Deadlines
${summary.important_dates.length ? summary.important_dates.map((d) => `- ${d}`).join('\n') : 'None identified'}

## Action Items
${summary.action_items.length ? summary.action_items.map((a) => `- [ ] ${a}`).join('\n') : 'None identified'}

## Tags
${summary.suggested_tags.map((tg) => `#${tg}`).join(' ')}

Suggested Filename: ${summary.suggested_filename}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!summary) return;
    const blob = new Blob([summary.summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.file_name.replace(/\.[^/.]+$/, '')}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="sloth-card p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-brand flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-800" />
            <span>AI Document Summarizer</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Extract text from PDFs, DOCX, TXT, and Markdown locally. Never sends document contents to cloud APIs.
          </p>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* File Picker */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-stone-700">Select Document to Summarize:</label>
            {supportedFiles.length > 0 ? (
              <select
                value={selectedFilePath}
                onChange={(e) => setSelectedFilePath(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-stone-50 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              >
                {supportedFiles.map((f) => (
                  <option key={f.path} value={f.path}>
                    {f.name} ({f.extension})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-lg bg-stone-100 text-stone-600 text-xs">
                No supported document found in current folder scan. Try scanning the Sample Workspace or your Documents folder first.
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Summary Length:</label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              {(['short', 'standard', 'detailed'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-1.5 rounded-lg capitalize font-medium transition-all ${
                    mode === m
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-emerald-700" />
            <span>Chunked local extraction using PyMuPDF & python-docx</span>
          </div>

          <button
            onClick={handleSummarize}
            disabled={isSummarizing || !selectedFilePath}
            className="sloth-btn-primary text-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{isSummarizing ? 'Sloth is Reading...' : 'Generate Summary'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading state with Sloth mascot */}
      {isSummarizing && (
        <div className="sloth-card p-12 text-center space-y-4">
          <SlothMascot size={90} mood="thinking" className="animate-bounce" />
          <h3 className="text-base font-bold text-stone-900 font-brand">
            Extracting text & generating summary...
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Your local open-weight model is processing the document on your machine without cloud uploads.
          </p>
        </div>
      )}

      {/* Summary Output Card */}
      {summary && (
        <div className="sloth-card p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-stone-900 font-brand">
                  {summary.file_name}
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Processed with <span className="font-semibold text-emerald-800 font-mono">{summary.model_used}</span> • {summary.word_count} words analyzed
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyMarkdown}
                className="sloth-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Markdown!' : 'Copy'}</span>
              </button>
              <button
                onClick={downloadMarkdown}
                className="sloth-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Executive Summary
            </h4>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs md:text-sm leading-relaxed text-stone-800">
              {summary.summary}
            </div>
          </div>

          {/* 5 Key Takeaways */}
          {summary.key_takeaways.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>Key Takeaways</span>
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {summary.key_takeaways.map((t, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-emerald-950 flex items-start gap-2"
                  >
                    <span className="font-bold text-emerald-700 font-mono">{idx + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deadlines & Action Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dates & Deadlines */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Important Dates & Deadlines</span>
              </h4>
              {summary.important_dates.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {summary.important_dates.map((d, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-stone-400 italic">No explicit dates identified.</p>
              )}
            </div>

            {/* Action Items */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>Action Items</span>
              </h4>
              {summary.action_items.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {summary.action_items.map((a, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-stone-400 italic">No specific action items detected.</p>
              )}
            </div>
          </div>

          {/* Tags & Filename Suggestion */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t text-xs">
            {/* Tags */}
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <div className="flex flex-wrap gap-1.5">
                {summary.suggested_tags.map((tg, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-stone-200/80 text-stone-700 text-[11px] font-medium"
                  >
                    #{tg}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Clean Name */}
            <div className="flex items-center gap-2 font-mono">
              <span className="text-stone-500 text-[11px]">Suggested Name:</span>
              <span className="font-semibold text-emerald-900 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                {summary.suggested_filename}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
