export interface FileInfo {
  name: str;
  path: str;
  relative_path: str;
  size_bytes: number;
  extension: str;
  category: str;
  modified_timestamp: number;
  is_supported: boolean;
  can_extract_text: boolean;
  is_archive_candidate?: boolean;
}

export interface DuplicateGroup {
  file_hash: str;
  file_size_bytes: number;
  file_paths: str[];
  count: number;
  wasted_bytes: number;
}

export interface ScanResult {
  directory_path: str;
  total_files: number;
  total_folders: number;
  total_size_bytes: number;
  extension_counts: Record<str, number>;
  category_counts: Record<str, number>;
  largest_files: FileInfo[];
  archive_candidates: FileInfo[];
  duplicates: DuplicateGroup[];
  files: FileInfo[];
  unsupported_count: number;
  scan_duration_ms: number;
  error?: str;
}

export interface FileSuggestion {
  original_path: str;
  original_name: str;
  proposed_name: str;
  proposed_category: str;
  explanation: str;
  confidence: number;
  validation_status: str;
}

export interface DocumentSummary {
  file_path: str;
  file_name: str;
  summary_mode: str;
  summary: str;
  key_takeaways: str[];
  important_dates: str[];
  action_items: str[];
  suggested_tags: str[];
  suggested_filename: str;
  word_count: number;
  model_used: str;
}

export interface PlannedAction {
  action_id: str;
  source_path: str;
  destination_path: str;
  operation_type: str;
  proposed_category: str;
  explanation: str;
  is_safe: boolean;
  safety_notes?: str;
  status: 'pending' | 'executed' | 'skipped' | 'failed';
  error_message?: str;
}

export interface ActionPlan {
  workspace_root: str;
  actions: PlannedAction[];
  total_actions: number;
  is_dry_run: boolean;
}

export interface ExecutionResult {
  session_id: str;
  workspace_root: str;
  total_requested: number;
  succeeded_count: number;
  failed_count: number;
  skipped_count: number;
  actions: PlannedAction[];
}

export interface SessionRecord {
  session_id: str;
  task_type: str;
  workspace_path: str;
  timestamp: number;
  files_analyzed: number;
  suggestions_count: number;
  executed_count: number;
  failed_count: number;
  skipped_count: number;
  is_undone: boolean;
}

export interface JournalRecord {
  id: number;
  session_id: str;
  source_path: str;
  destination_path: str;
  status: str;
  timestamp: number;
  is_undone: boolean;
}

export interface OllamaStatus {
  is_reachable: boolean;
  configured_model: str;
  model_available: boolean;
  available_models: str[];
  endpoint_url: str;
  error_message?: str;
}
type str = string;
