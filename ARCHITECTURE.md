# LazyDesk AI Architecture Specification

LazyDesk AI is a privacy-first, desktop-class digital assistant that automates file organization, document summarization, duplicate detection, and workspace decluttering with local open-weight AI.

---

## 1. High-Level Architecture Overview

```
+---------------------------------------------------------------------------------+
|                                 USER INTERFACE                                  |
|     React 19 + TypeScript + Vite + Tailwind/Custom Design System (Warm Ivory)   |
|   Dashboard | Smart Organizer | Summarizer | Duplicate Finder | Lazy Mode       |
+---------------------------------------------------------------------------------+
                                       |
                               REST / JSON API
                                       |
+---------------------------------------------------------------------------------+
|                      FASTAPI BACKEND / RENDER CONTAINER                         |
|                                                                                 |
|  +--------------------+   +---------------------+   +------------------------+  |
|  | Smart Scanner      |   | Fast SHA-256 Hasher |   | Local Extractor        |  |
|  | (os.walk, sandbox) |   | (size pre-filter)   |   | (PyMuPDF, docx, txt)   |  |
|  +--------------------+   +---------------------+   +------------------------+  |
|            |                         |                          |               |
|  +---------------------------------------------------------------------------+  |
|  | Local AI Service Adapter (Ollama HTTP Gateway / Local Heuristics)         |  |
|  | Model: Google Gemma 2 2B (gemma2:2b) - JSON schema enforcement & bounds   |  |
|  +---------------------------------------------------------------------------+  |
|            |                                                                    |
|  +-----------------------------------------+   +-----------------------------+  |
|  | Action Planner & Safe Executor          |   | SQLite History & Journal    |  |
|  | (Boundary validation, collision safety) |   | (Reversible 1-click Undo)   |  |
|  +-----------------------------------------+   +-----------------------------+  |
|            |                                                                    |
|  +---------------------------------------------------------------------------+  |
|  | Cloud Health & Sandbox Layer: /api/health | HOSTED_DEMO=true Sandbox      |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
                                       |
                         Local HTTP (11434 / In-process)
                                       |
+---------------------------------------------------------------------------------+
|                       LOCAL OLLAMA INFERENCE ENGINE                             |
|               Google Gemma 2 2B (gemma2:2b, Open Weights)                      |
+---------------------------------------------------------------------------------+
```

---

## 2. Core Modules & Responsibilities

### 2.1 Backend Modules

1. **`backend.scanner`**:
   - Safely walks directories up to configured depth limits (default 4).
   - Skips symlinks and hidden/system folders (`.git`, `node_modules`, `venv`, `$RECYCLE.BIN`).
   - Categorizes files by extension into `Documents`, `Work & Study`, `Images & Media`, `Code & Dev`, `Archives`, `Miscellaneous`.
   - Identifies candidate files for archiving (unmodified for > 90 days or large unreferenced files).
   - Sandboxing: In `HOSTED_DEMO=true` mode, all scanning is forced to remain within the synthetic `sample_workspace/`.

2. **`backend.hasher`**:
   - Optimized two-tier duplicate detection:
     - Tier 1: Group files by byte size. Files with unique sizes are never hashed.
     - Tier 2: Stream SHA-256 chunked hashing only for files sharing duplicate byte sizes.
   - Calculates reclaimable storage savings.

3. **`backend.extractor`**:
   - Extracts plain text and page metadata:
     - PDF: PyMuPDF (`fitz`) local text parser.
     - DOCX: `python-docx` paragraph and table parser.
     - Text/Code: UTF-8 / Latin-1 streaming reader.
   - Chunks text into bounded contexts (max 3,500 characters) to ensure prompt boundaries are respected.

4. **`backend.ai_service`**:
   - Connects to Ollama (`http://localhost:11434`).
   - Default model: **`gemma2:2b`** (Google Gemma 2 2B open weights).
   - Strict JSON Schema prompting: Injects concrete output schemas into the prompt with temperature 0.1, context window limited to 1,536 tokens, and max prediction bounded to 380 tokens for rapid deterministic response on CPU/GPU.
   - Hardened system prompt: Explicitly treats file contents as untrusted data to defend against prompt injection.
   - Graceful fallback: If Ollama is offline or uninstalled, deterministic heuristic rules classify files and extract key sentences without crashing.

5. **`backend.organizer`**:
   - Converts AI suggestions into a **Dry-Run Action Plan**.
   - Path Traversal Defense: Verifies `os.path.commonpath([root, dest]) == root`.
   - Collision Resolver: Computes non-destructive filenames (`file_1.ext`) if target already exists.
   - Execution Engine: Operates only on user-approved items; never deletes original files.

6. **`backend.history`**:
   - Persists session metadata and granular file operations in SQLite (`lazydesk_history.db`).
   - Context-managed SQLite connections preventing database file locking.
   - Tracks `(source_path, destination_path, status, is_undone)`.
   - Undo Manager: Safely reverts moved/renamed files back to their exact original paths.

7. **`backend.demo_workspace`**:
   - Generates fictional, realistic sample files (invoices, meeting notes, todo lists, duplicated images) for safe exploration without risking real personal files.

---

## 3. Data Flow

### The "Lazy Mode" Flow:
1. **User Action**: Clicks "Run Full Lazy Declutter".
2. **Scanner & Hasher**: Gathers file metadata, detects duplicates, and measures disk usage.
3. **Extractor**: Pulls snippets from text and documents.
4. **Local AI Service**: Prompts Google Gemma 2 (`gemma2:2b`) with untrusted snippets and receives structured JSON.
5. **Action Planner**: Generates dry-run operations and checks path boundaries.
6. **Summarizer**: Produces executive bullet points and deadlines for top documents.
7. **Staging UI**: Displays all proposed operations with interactive checkboxes.
8. **Execution**: Moves approved files into clean subdirectories, recording each step in the SQLite journal.
9. **1-Click Undo**: Reverts all operations back to their initial state on demand.

---

## 4. Cloud Deployment (Render)

LazyDesk AI provides first-class support for cloud deployment on Render:
- **Render Blueprint (`render.yaml`)**:
  - `type: web`, `env: docker`, `plan: starter`
  - Health check path: `/api/health`
  - Dynamic port binding: reads `$PORT` and runs Uvicorn on `0.0.0.0:$PORT`.
- **Hosted Demo Sandbox Mode (`HOSTED_DEMO=true`)**:
  - Ensures visitors to the hosted cloud demo can explore all features (scanning, duplicate detection, categorization, executive summaries, undo) strictly within synthetic document collections.
  - Rejects attempts to traverse into host server root directories.
