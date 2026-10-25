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
|                              FASTAPI BACKEND                                    |
|                                                                                 |
|  +--------------------+   +---------------------+   +------------------------+  |
|  | Smart Scanner      |   | Fast SHA-256 Hasher |   | Local Extractor        |  |
|  | (os.walk, safety)  |   | (size pre-filter)   |   | (PyMuPDF, docx, txt)   |  |
|  +--------------------+   +---------------------+   +------------------------+  |
|            |                         |                          |               |
|  +---------------------------------------------------------------------------+  |
|  | Local AI Service (Ollama HTTP Gateway)                                    |  |
|  | Model: qwen2.5:3b (JSON schema enforcement, injection defense, retries)   |  |
|  +---------------------------------------------------------------------------+  |
|            |                                                                    |
|  +-----------------------------------------+   +-----------------------------+  |
|  | Action Planner & Safe Executor          |   | SQLite History & Journal    |  |
|  | (Boundary validation, collision safety) |   | (Reversible 1-click Undo)   |  |
|  +-----------------------------------------+   +-----------------------------+  |
+---------------------------------------------------------------------------------+
                                       |
                              Local HTTP (11434)
                                       |
+---------------------------------------------------------------------------------+
|                           LOCAL OLLAMA RUNTIME                                  |
|                      qwen2.5:3b (Open-Weight Model)                             |
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
   - Uses `format="json"` with temperature 0.2 for deterministic categorization and summarization.
   - Hardened system prompt: Explicitly treats file contents as untrusted data to defend against prompt injection.
   - Graceful fallback: If Ollama is offline or uninstalled, deterministic heuristic rules classify files and extract key sentences without crashing.

5. **`backend.organizer`**:
   - Converts AI suggestions into a **Dry-Run Action Plan**.
   - Path Traversal Defense: Verifies `os.path.commonpath([root, dest]) == root`.
   - Collision Resolver: Computes non-destructive filenames (`file_1.ext`) if target already exists.
   - Execution Engine: Operates only on user-approved items; never deletes original files.

6. **`backend.history`**:
   - Persists session metadata and granular file operations in SQLite (`lazydesk_history.db`).
   - Tracks `(source_path, destination_path, status, is_undone)`.
   - Undo Manager: Safely reverts moved/renamed files back to their original source locations.

7. **`backend.demo_workspace`**:
   - Generates fictional, realistic sample files (invoices, meeting notes, todo lists, duplicated images) for safe exploration without risking real personal files.

---

## 3. Data Flow

### The "Lazy Mode" Flow:
1. **User Action**: Clicks "Run Full Lazy Declutter".
2. **Scanner & Hasher**: Gathers file metadata, detects duplicates, and measures disk usage.
3. **Extractor**: Pulls snippets from text and documents.
4. **Local AI Service**: Prompts `qwen2.5:3b` with untrusted snippets and receives structured JSON.
5. **Action Planner**: Generates dry-run operations and checks path boundaries.
6. **Summarizer**: Produces executive bullet points and deadlines for top documents.
7. **User Review**: Displays consolidated report. Operations remain staged until the user clicks "Approve & Execute".
8. **Execution**: Safely moves files into organized folders and writes to the SQLite journal.
9. **Reversibility**: User can click "Undo" at any time to return files to their exact initial paths.

---

## 4. Privacy & Security Model

- **No Remote Calls**: The application never talks to external APIs or telemetry servers.
- **Local Weight Inference**: Runs against local Ollama inference server.
- **Strict Boundary Check**: Deterministic validation prevents path traversal escapes.
- **Zero Accidental Overwrite**: Collision avoidance ensures no data loss.
- **Reversibility**: Operations are journaled in SQLite and reversible with 1-click Undo.
