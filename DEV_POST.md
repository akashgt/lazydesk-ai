# LazyDesk AI — Your Digital Sloth Assistant 🦥
## Stay Lazy. Get Organized.

*Submitted to the **Hacktoberfest Open-Source AI Challenge, Week 3 — “Slow and Steady”***  
*Featuring Partner Integrations: **Google Gemma** & **Render***

---

## 1. What I Built

Most people's computers have at least one terrifying directory—usually `Downloads` or `Desktop`—filled with chaotic files like `Invoice_2026_Q1_draft (1).pdf`, `Screenshot 2026-10-25 at 14.02.11.png`, unorganized meeting notes, and duplicate budget spreadsheets. Sorting through these files manually is tedious, repetitive, and mentally draining.

Inspired by the philosophy of the sloth ("do less manual work and let automation handle the boring chores"), I built **LazyDesk AI**—a privacy-first desktop application that automatically scans cluttered folders, categorizes files, suggests clean standardized filenames, detects exact duplicates, and generates document summaries with key takeaways.

Crucially, **LazyDesk AI sends zero confidential data to proprietary cloud AI APIs**. All file analysis, hashing, document extraction, and inference run entirely on your local machine using **Google Gemma 2 (`gemma2:2b`)** open weights powered by Ollama.

LazyDesk AI also includes a production-ready **Render Blueprint (`render.yaml`)** and multi-stage container deployment for running hosted demonstrations safely in the cloud with automated sandboxing.

### Core Highlights
- 🦥 **Lazy Mode**: A single-click pipeline that scans a cluttered folder, detects duplicates, proposes clean categories/filenames, and produces executive summaries—staged cleanly for your review before touching a single file on disk.
- 📁 **Smart Folder Scanner & Organizer**: Safe directory traversal with path-traversal defenses, collision avoidance, and categorized grouping (`Documents`, `Work & Study`, `Images & Media`, `Finance`, `Personal`, `Archives`, `Code & Dev`).
- 📄 **Local Document Summarizer**: Extracts text from PDFs (PyMuPDF), Word documents (python-docx), Markdown, and TXT files, providing 5 key takeaways, deadlines, action items, and suggested tags without cloud APIs.
- 🔍 **Exact Duplicate Detector**: Two-tier SHA-256 hash detection that identifies identical files and calculates reclaimable disk space without automated deletions.
- ⏪ **1-Click Safety Journal & Undo**: Persistent SQLite operation journal that tracks every file move and enables instant rollback if you change your mind.
- 🧪 **Demo Mode**: Built-in sample workspace with fictional invoices, meeting notes, budgets, and duplicate photos for zero-risk testing.

---

## 2. Partner Integrations

### 🏆 Best Use of Gemma — Google Gemma 2 2B Integration
LazyDesk AI uses Google's open-weight **Gemma 2 (`gemma2:2b`)** as its primary default intelligence engine:
- **Genuine Local Inference**: We verified real local inference via Ollama (`ollama pull gemma2:2b`). Gemma 2 inspects document snippets, proposes clean filenames (e.g., transforming `Invoice_2026_Q1_draft (1).pdf` into `Acme_Consulting_Invoice_2026-03-31.pdf`), and assigns accurate categories (`Finance`, `Work & Study`, etc.).
- **Deterministic JSON Schemas**: We crafted specialized JSON-constrained system prompts tailored to Gemma 2's reasoning format, bounded by `num_ctx: 1536` and `temperature: 0.1` for snappy inference and strict validation against Pydantic schemas.
- **Model Adapter Flexibility**: While Gemma 2 is the default powerhouse, our AI adapter pattern preserves user choice—allowing one-click switching to `qwen2.5:3b`, `llama3.2:3b`, or any installed Ollama model.
- **Licensing & Auditability**: Gemma 2 is distributed under the Google Gemma Terms of Use, providing verifiable open weights with no telemetry or external leakage.

### 🏆 Best Use of Render — Cloud Deployment & Hosted Demo Blueprint
LazyDesk AI makes full use of **Render** to bridge the gap between local privacy-first desktop tools and cloud-accessible demonstrations:
- **Render Blueprint (`render.yaml`)**: An Infrastructure-as-Code Blueprint defining the complete web service with Docker environment, environment variables, and automated builds.
- **Multi-Stage Container (`Dockerfile`)**: Combines Node 20 for compiling the React 19 + TypeScript frontend with a lightweight Python 3.11 slim image serving the FastAPI backend and bundled static assets.
- **Automated Health Checks**: Implements `/api/health` enabling Render's zero-downtime rolling deploys and uptime monitors.
- **Hosted Demo Sandbox Mode (`HOSTED_DEMO=true`)**: A dedicated security boundary that locks directory scanning and organizing strictly to the synthetic `sample_workspace/`. This allows public visitors to test LazyDesk AI on Render without exposing the host container's filesystem.

---

## 3. Demo Walkthrough

Check out the verified demo recording of the complete workflow:
`file:///C:/Users/akash_ude/.gemini/antigravity-ide/brain/394c869b-990e-40b3-b6ec-2286aeb968d2/lazydesk_demo_1792937463412.webp`

### Quick Run Locally
```bash
git clone https://github.com/akashgt/lazydesk-ai.git
cd lazydesk-ai
ollama pull gemma2:2b
python run.py
```
This automatically starts the backend API, loads the pre-built warm-ivory web UI, spins up the demo workspace, and connects to Google Gemma 2.

---

## 4. Code & Architecture

- **Repository**: [LazyDesk AI on GitHub](https://github.com/akashgt/lazydesk-ai)
- **License**: MIT License (Application) • Google Gemma Terms of Use (Gemma 2 Model)
- **Tech Stack**: React 19, TypeScript, Vite, FastAPI, Uvicorn, PyMuPDF, python-docx, SQLite, Ollama, Google Gemma 2, Render Blueprint.

---

## 5. Security & Safety Boundaries

1. **Untrusted Data Boundary**: Filenames and document text are treated as untrusted data. Prompts explicitly enforce that file contents cannot override model instructions.
2. **Path Traversal Protection**: All destinations are validated with `os.path.commonpath([root, dest]) == root`. Operations cannot escape the selected folder.
3. **Collision Avoidance**: Accidental overwrites are prevented by automatically generating non-colliding suffixes (`_1.ext`).
4. **Reversible Journal**: All operations are recorded in SQLite and can be rolled back in 1 click.
5. **Render Cloud Sandbox**: When running on Render (`HOSTED_DEMO=true`), all filesystem access is locked to synthetic sample files.

---

## 6. Prize Categories

This project is submitted for:
- **Hacktoberfest Open-Source AI Challenge — Week 3: Slow and Steady**
- **Best Use of Gemma** (Google Gemma 2 2B default model for file classification and document summarization)
- **Best Use of Render** (Render Blueprint `render.yaml`, multi-stage Dockerfile, `/api/health` monitoring, and sandboxed hosted demo mode)

---

*Stay lazy. Get organized with LazyDesk AI.* 🦥
