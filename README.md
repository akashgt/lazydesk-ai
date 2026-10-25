# LazyDesk AI 🦥
### *Stay lazy. Get organized.*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Ollama Powered](https://img.shields.io/badge/Ollama-qwen2.5%3A3b-black.svg?logo=ollama&logoColor=white)](https://ollama.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-11%20Passed-brightgreen.svg)](backend/tests/)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-Week%203%20Challenge-orange.svg)](DEV_POST.md)

**LazyDesk AI** is a privacy-first, desktop-class digital assistant inspired by the philosophy of the sloth: do less manual work and let local open-weight automation handle the boring chores. 

LazyDesk scans messy folders, categorizes files, suggests standardized filenames, detects exact duplicates, and generates document summaries with key takeaways—**running 100% locally with zero cloud API keys or subscriptions**.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **🦥 Lazy Mode** | **One-click automation**: Scans, detects duplicates, proposes categories/filenames, and summarizes top documents in a unified staged plan. |
| **📁 Smart Organizer** | Safe filesystem walker with category sorting (`Documents`, `Work & Study`, `Images & Media`, `Finance`, `Personal`, `Archives`, `Code & Dev`). |
| **📄 Local Document Summarizer** | Extracts text from PDFs (PyMuPDF), Word docs (python-docx), Markdown, and TXT files. Generates 5 key takeaways, deadlines, and action items locally. |
| **🔍 Exact Duplicate Detector** | Two-tier SHA-256 hash detection that finds duplicate clusters and measures reclaimable storage without automatic file deletions. |
| **⏪ Safety Journal & 1-Click Undo** | Persistent SQLite operation journal that tracks every file move, enabling instant rollback if you change your mind. |
| **🛡️ Privacy & Path Traversal Protection** | Strictly confines file moves inside the workspace boundary; defends against prompt injection; auto-resolves naming collisions. |
| **🧪 Zero-Risk Demo Mode** | Includes a built-in sample workspace with fictional invoices, meeting notes, spreadsheets, and duplicate images for risk-free testing. |

---

## 🎨 Visual Identity & Architecture

LazyDesk AI features a warm ivory palette (`#FAF8F5`), deep forest-green accents (`#1B4332`), soft sage cards, charcoal typography, and an expressive vector sloth mascot in various moods (relaxed, thinking, celebrating, sleeping).

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

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)
- **Ollama**: Download and install from [ollama.com](https://ollama.com).

### 2. Pull the Open-Weight Model
```bash
# Start Ollama daemon
ollama serve

# Pull the lightweight default model (1.9 GB)
ollama pull qwen2.5:3b
```

### 3. Clone & Install
```bash
git clone https://github.com/your-username/lazydesk-ai.git
cd lazydesk-ai

# Install Python dependencies
pip install fastapi uvicorn pymupdf python-docx pydantic httpx pytest pytest-asyncio

# Install Frontend dependencies and build
npm install
npm run build
```

### 4. Run LazyDesk AI
```bash
python run.py
```
LazyDesk will automatically start the unified server and open your browser to **`http://127.0.0.1:8000/`**.

---

## 🧪 Automated Testing

LazyDesk includes a comprehensive pytest suite covering all core operations, security boundaries, and resilience mechanisms:

```bash
python -m pytest backend/tests -v
```

### Test Coverage Highlights
- ✅ **`test_scanner.py`**: Safe directory traversal, extension breakdown, and system directory exclusion (`.git`, `node_modules`).
- ✅ **`test_hasher.py`**: Size pre-filtering and exact SHA-256 duplicate detection.
- ✅ **`test_extractor.py`**: PDF (PyMuPDF), Word (python-docx), and Markdown text extraction with word counts and chunking.
- ✅ **`test_organizer_safety.py`**: Strict path traversal defense (`../../etc`), collision resolution (`file_1.ext`), and dry-run safety verification.
- ✅ **`test_history_undo.py`**: SQLite session logging, journal recording, and 1-click Undo file reversal.
- ✅ **`test_ai_fallback.py`**: Graceful deterministic heuristics when Ollama is offline or uninstalled.

---

## 🔒 Security & Privacy Guarantees

1. **Zero External Calls**: No documents, filenames, or summaries are ever uploaded to cloud AI providers or telemetry endpoints.
2. **Untrusted Data Boundary**: Filenames and document text are treated as untrusted data. The system prompt instructs the model that contents cannot override instructions or execute shell commands.
3. **Strict Path Traversal Protection**: Destinations are verified using `os.path.commonpath([root, dest]) == root`. Operations cannot escape the selected folder.
4. **Zero Accidental Overwrite**: Collision avoidance automatically appends non-destructive increments (`_1.ext`).
5. **No Automatic File Deletions**: Original files are moved into category folders, never permanently deleted.
6. **Reversibility**: All executed file operations are journaled in SQLite and can be rolled back at any time.

---

## 💡 Why Open AI Matters

| Pillar | Why it matters in LazyDesk AI |
| :--- | :--- |
| **Privacy by Design** | Desktop decluttering processes personal documents, tax receipts, and contracts. Local open-weight models keep confidential files strictly on your device. |
| **User Sovereignty** | Switch freely between Qwen, Llama, Mistral, or Gemma without touching proprietary APIs or proprietary vendor terms. |
| **Zero Per-Token Cost** | Decluttering 500 files doesn't incur token bills or monthly subscriptions. |
| **Offline Potential** | After pulling weights once, LazyDesk works in planes, trains, and air-gapped secure facilities without internet access. |
| **Auditable Transparency** | Open-source code and model integration allows anyone to audit data flows and safety rules. |

---

## 📜 Licensing

- **Application Software**: Licensed under the **[MIT License](LICENSE)**.
- **Model Weights**: The default model (`qwen2.5:3b`) is developed by Alibaba Cloud and licensed under the **Apache 2.0 License**.

---

*Stay lazy. Get organized with LazyDesk AI.* 🦥
