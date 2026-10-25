# LazyDesk AI 🦥
### *Stay lazy. Get organized.*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Google Gemma 2](https://img.shields.io/badge/Model-Google%20Gemma%202%20(2B)-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Render Blueprint](https://img.shields.io/badge/Render-Deploy%20Ready-46E3B7.svg?logo=render&logoColor=black)](render.yaml)
[![Tests Passing](https://img.shields.io/badge/Tests-11%20Passed-brightgreen.svg)](backend/tests/)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-Week%203%20Challenge-orange.svg)](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)

**LazyDesk AI** is a privacy-first, desktop-class digital productivity assistant inspired by the philosophy of the sloth: do less manual work and let local open-weight automation handle the boring chores. 

LazyDesk scans messy folders, categorizes files, suggests standardized filenames, detects exact duplicates, and generates document summaries with key takeaways—**powered by Google's Gemma 2 open-weight model through Ollama, running 100% locally with zero cloud API keys, zero subscriptions, and complete data sovereignty**.

LazyDesk AI also includes a production-ready **Render Blueprint & multi-stage Docker deployment** with sandboxed demo mode for hosted cloud demonstrations.

---

## 🏆 Partner Integrations

### 1. Google Gemma — Best Use of Gemma
LazyDesk AI integrates Google's open-weight **Gemma 2 (`gemma2:2b`)** as its default local intelligence engine through Ollama:
- **Genuine Local Inference**: Powers file classification into 7 smart categories, context-aware filename standardization, and executive document extraction with structured JSON output enforcement.
- **Model Adapter Architecture**: Preserves full model freedom. Switch seamlessly between `gemma2:2b`, `qwen2.5:3b`, `llama3.2:3b`, or any Ollama-compatible open weights directly from the UI.
- **License & Verification**: Uses Google Gemma under the official [Gemma Terms of Use](https://ai.google.dev/gemma/terms). Verified locally with bounded inference (`num_ctx: 1536`, `num_predict: 380`, `temperature: 0.1`) for deterministic and fast CPU/GPU execution.
- **Live Model Status**: The UI prominently displays active model status, local weight verification, and latency diagnostics.

### 2. Render — Best Use of Render
LazyDesk AI is fully configured for cloud deployment on **Render**:
- **Render Blueprint (`render.yaml`)**: Infrastructure-as-code blueprint ready for 1-click Render web service deployment.
- **Multi-Stage Dockerfile**: Builds the React 19 + TypeScript frontend with Vite and runs the FastAPI backend via Python 3.11 slim in an optimized single container.
- **Health Check & Cloud Port Binding**: Implements `/api/health` for automated zero-downtime health monitoring and dynamically binds to `$PORT`.
- **Sandboxed Hosted Demo Mode (`HOSTED_DEMO=true`)**: Protects server security by locking directory scanning and file staging exclusively to the built-in synthetic `sample_workspace/` directory, preventing hosted web visitors from accessing host files.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **🦥 Lazy Mode** | **One-click automation**: Scans, detects duplicates, proposes categories/filenames with Google Gemma 2, and summarizes top documents in a unified staged plan. |
| **📁 Smart Organizer** | Safe filesystem walker with category sorting (`Documents`, `Work & Study`, `Images & Media`, `Finance`, `Personal`, `Archives`, `Code & Dev`). |
| **📄 Local Document Summarizer** | Extracts text from PDFs (PyMuPDF), Word docs (python-docx), Markdown, and TXT files. Generates 5 key takeaways, deadlines, and action items locally. |
| **🔍 Exact Duplicate Detector** | Two-tier SHA-256 hash detection that finds duplicate clusters and measures reclaimable storage without automatic file deletions. |
| **⏪ Safety Journal & 1-Click Undo** | Persistent SQLite operation journal that tracks every file move, enabling instant rollback if you change your mind. |
| **🛡️ Privacy & Path Traversal Protection** | Strictly confines file moves inside the workspace boundary; defends against prompt injection; auto-resolves naming collisions. |
| **🧪 Sandboxed Demo Workspace** | Includes a built-in sample workspace with fictional invoices, meeting notes, spreadsheets, and duplicate images for risk-free testing. |

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
|                      FASTAPI BACKEND / RENDER DOCKER CONTAINER                   |
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

## 🚀 Quick Start Guide (Local Desktop)

### 1. Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)
- **Ollama**: Download and install from [ollama.com](https://ollama.com).

### 2. Pull Google Gemma 2
```bash
# Start Ollama daemon
ollama serve

# Pull Google Gemma 2 (2B open weights, 1.6 GB)
ollama pull gemma2:2b
```

### 3. Clone & Install
```bash
git clone https://github.com/akashgt/lazydesk-ai.git
cd lazydesk-ai

# Install Python dependencies
pip install -r requirements.txt

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

## ☁️ Deploying to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/akashgt/lazydesk-ai)

LazyDesk AI includes a complete **Render Blueprint (`render.yaml`)** and multi-stage `Dockerfile`.

### Option A: 1-Click Blueprint Deploy (Render Dashboard)
1. Fork or push this repository to your GitHub account.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Blueprint**.
4. Connect your `lazydesk-ai` repository. Render will automatically detect [`render.yaml`](render.yaml).
5. Review the plan (Web Service using Docker) and click **Apply**.
6. Render will automatically build the container and deploy the service.

### Option B: Render CLI Deploy
```bash
# Authenticate with Render
render login

# Deploy using the Blueprint
render blueprint launch
```

### Render Configuration Details
- **Build Type**: `Dockerfile` (Multi-stage Node 20 frontend compilation + Python 3.11 slim runtime).
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `HOSTED_DEMO=true`: Restricts filesystem operations strictly to synthetic sample workspace.
  - `PORT=8000`: Bound automatically by Render.
  - `OLLAMA_MODEL=gemma2:2b`: Default model configuration.

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

1. **Zero External Calls**: In local mode, no documents, filenames, or summaries are ever uploaded to cloud AI providers or telemetry endpoints.
2. **Untrusted Data Boundary**: Filenames and document text are treated as untrusted data. The system prompt instructs the model that contents cannot override instructions or execute shell commands.
3. **Strict Path Traversal Protection**: Destinations are verified using `os.path.commonpath([root, dest]) == root`. Operations cannot escape the selected folder.
4. **Zero Accidental Overwrite**: Collision avoidance automatically appends non-destructive increments (`_1.ext`).
5. **No Automatic File Deletions**: Original files are moved into category folders, never permanently deleted.
6. **Reversibility**: All executed file operations are journaled in SQLite and can be rolled back at any time.
7. **Cloud Sandboxing**: When `HOSTED_DEMO=true` is set on Render, directory browsing is strictly constrained to `sample_workspace/` so visitors cannot read or modify the host operating system.

---

## 💡 Why Open AI Matters

| Pillar | Why it matters in LazyDesk AI |
| :--- | :--- |
| **Privacy by Design** | Desktop decluttering processes personal documents, tax receipts, and contracts. Local open-weight models keep confidential files strictly on your device. |
| **User Sovereignty** | Switch freely between Gemma 2, Qwen, Llama, or Mistral without touching proprietary APIs or proprietary vendor terms. |
| **Zero Per-Token Cost** | Decluttering 500 files doesn't incur token bills or monthly subscriptions. |
| **Offline Potential** | After pulling weights once, LazyDesk works in planes, trains, and air-gapped secure facilities without internet access. |
| **Auditable Transparency** | Open-source code and model integration allows anyone to audit data flows and safety rules. |

---

## 📜 Licensing

- **Application Software**: Licensed under the **[MIT License](LICENSE)**.
- **Model Weights**: Google Gemma 2 2B is licensed under the **[Google Gemma Terms of Use](https://ai.google.dev/gemma/terms)**. Alternate model Qwen 2.5 is licensed under Apache 2.0.

---

*Stay lazy. Get organized with LazyDesk AI.* 🦥
