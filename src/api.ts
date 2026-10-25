import {
  ScanResult,
  FileSuggestion,
  ActionPlan,
  ExecutionResult,
  DocumentSummary,
  SessionRecord,
  JournalRecord,
  OllamaStatus,
} from './types';

const BASE_URL = '/api';

export async function fetchHealth(): Promise<{ status: string; app_name: string; version: string; ollama: OllamaStatus }> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
  return res.json();
}

export async function selectModel(modelName: string): Promise<{ active_model: string; status: OllamaStatus }> {
  const res = await fetch(`${BASE_URL}/models/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_name: modelName }),
  });
  if (!res.ok) throw new Error('Failed to switch model');
  return res.json();
}

export async function scanFolder(directoryPath: string): Promise<ScanResult> {
  const res = await fetch(`${BASE_URL}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directory_path: directoryPath }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Scan failed' }));
    throw new Error(err.detail || 'Scan failed');
  }
  return res.json();
}

export async function categorizeFiles(directoryPath: string, files: any[]): Promise<FileSuggestion[]> {
  const res = await fetch(`${BASE_URL}/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directory_path: directoryPath, files }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Categorization failed' }));
    throw new Error(err.detail || 'Categorization failed');
  }
  return res.json();
}

export async function generateActionPlan(workspaceRoot: string, suggestions: FileSuggestion[]): Promise<ActionPlan> {
  const res = await fetch(`${BASE_URL}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace_root: workspaceRoot, suggestions }),
  });
  if (!res.ok) throw new Error('Failed to generate action plan');
  return res.json();
}

export async function executePlan(
  actionPlan: ActionPlan,
  approvedActionIds?: string[],
  taskType: string = 'Smart Organizer'
): Promise<ExecutionResult> {
  const res = await fetch(`${BASE_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_plan: actionPlan,
      approved_action_ids: approvedActionIds,
      task_type: taskType,
    }),
  });
  if (!res.ok) throw new Error('Failed to execute action plan');
  return res.json();
}

export async function summarizeDocument(filePath: string, mode: 'short' | 'standard' | 'detailed' = 'standard'): Promise<DocumentSummary> {
  const res = await fetch(`${BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_path: filePath, mode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Summarization failed' }));
    throw new Error(err.detail || 'Summarization failed');
  }
  return res.json();
}

export async function runLazyMode(
  directoryPath: string,
  includeSummaries: boolean = true,
  maxSummaries: number = 3
): Promise<{
  scan: ScanResult;
  suggestions: FileSuggestion[];
  action_plan: ActionPlan;
  summaries: DocumentSummary[];
  duplicates: any[];
  status: string;
}> {
  const res = await fetch(`${BASE_URL}/lazy-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      directory_path: directoryPath,
      include_summaries: includeSummaries,
      max_summaries: maxSummaries,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Lazy Mode failed' }));
    throw new Error(err.detail || 'Lazy Mode failed');
  }
  return res.json();
}

export async function getHistory(): Promise<SessionRecord[]> {
  const res = await fetch(`${BASE_URL}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function getJournal(sessionId: string): Promise<JournalRecord[]> {
  const res = await fetch(`${BASE_URL}/history/${sessionId}/journal`);
  if (!res.ok) throw new Error('Failed to fetch session journal');
  return res.json();
}

export async function undoSession(sessionId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/history/${sessionId}/undo`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Undo failed' }));
    throw new Error(err.detail || 'Undo failed');
  }
  return res.json();
}

export async function clearHistory(): Promise<void> {
  const res = await fetch(`${BASE_URL}/history`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
}

export async function resetDemoWorkspace(): Promise<{ message: string; path: string; is_demo: boolean }> {
  const res = await fetch(`${BASE_URL}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to prepare demo workspace');
  return res.json();
}

export async function getPickerSuggestions(): Promise<{ suggestions: Array<{ name: string; path: string }> }> {
  const res = await fetch(`${BASE_URL}/picker`);
  if (!res.ok) throw new Error('Failed to load path suggestions');
  return res.json();
}
