# LazyDesk AI — Your Digital Sloth Assistant 🦥
## Stay Lazy. Get Organized.

*Submitted to the **Hacktoberfest Open-Source AI Challenge, Week 3 — “Slow and Steady”***

---

## 1. What I Built

Most people's computers have at least one terrifying directory—usually `Downloads` or `Desktop`—filled with chaotic files like `Invoice_2026_Q1_draft (1).pdf`, `Screenshot 2026-10-25 at 14.02.11.png`, unorganized meeting notes, and duplicate budget spreadsheets. Sorting through these files manually is tedious, repetitive, and mentally draining.

Inspired by the philosophy of the sloth ("do less manual work and let automation handle the boring chores"), I built **LazyDesk AI**—a privacy-first desktop application that automatically scans cluttered folders, categorizes files, suggests clean standardized filenames, detects exact duplicates, and generates document summaries with key takeaways.

Crucially, **LazyDesk AI sends zero data to cloud AI providers**. All file analysis, hashing, document extraction, and inference run entirely on your local machine using an open-weight model (`qwen2.5:3b`) powered by Ollama.

### Core Highlights
- 🦥 **Lazy Mode**: A single-click pipeline that scans a cluttered folder, detects duplicates, proposes clean categories/filenames, and produces executive summaries—staged cleanly for your review before touching a single file on disk.
- 📁 **Smart Folder Scanner & Organizer**: Safe directory traversal with path-traversal defenses, collision avoidance, and categorized grouping (`Documents`, `Work & Study`, `Images & Media`, `Finance`, `Personal`, `Archives`, `Code & Dev`).
- 📄 **Local Document Summarizer**: Extracts text from PDFs (PyMuPDF), Word documents (python-docx), Markdown, and TXT files, providing 5 key takeaways, deadlines, action items, and suggested tags without cloud APIs.
- 🔍 **Exact Duplicate Detector**: Two-tier SHA-256 hash detection that identifies identical files and calculates reclaimable disk space without automated deletions.
- ⏪ **1-Click Safety Journal & Undo**: Persistent SQLite operation journal that tracks every file move and enables instant rollback if you change your mind.
- 🧪 **Demo Mode**: Built-in sample workspace with fictional invoices, meeting notes, budgets, and duplicate photos for zero-risk testing.

---

## 2. Demo

Check out the verified demo walkthrough recording:
`file:///C:/Users/akash_ude/.gemini/antigravity-ide/brain/394c869b-990e-40b3-b6ec-2286aeb968d2/lazydesk_demo_1792937463412.webp`

### Quick Run
```bash
git clone https://github.com/your-username/lazydesk-ai.git
cd lazydesk-ai
python run.py
```
This automatically starts the backend API, loads the pre-built warm-ivory web UI, spins up the demo workspace, and checks your local Ollama runtime.

---

## 3. Code

- **Repository**: [LazyDesk AI on GitHub](https://github.com/your-username/lazydesk-ai)
- **License**: MIT License (Application) • Apache 2.0 (Qwen 2.5 3B Model Weights)
- **Tech Stack**: React 19, TypeScript, Vite, FastAPI, Uvicorn, PyMuPDF, python-docx, SQLite, Ollama.

---

## 4. How I Built It

LazyDesk AI was engineered around strict privacy, deterministic safety boundaries, and local open-weight AI:

### Architecture
1. **Frontend**: Built with React 19, TypeScript, and Vite. I designed a custom design system ("Warm Ivory") featuring forest-green accents, soft sage cards, charcoal typography, and a friendly sloth mascot in various poses (relaxed, thinking, celebrating, sleeping).
2. **Backend**: FastAPI with Uvicorn. The backend handles local filesystem scanning (`os.walk`), fast size-filtered SHA-256 hashing, chunked document extraction (PyMuPDF & python-docx), and SQLite operation journaling.
3. **Local AI Engine**: Direct integration with Ollama's HTTP API (`http://localhost:11434`). The system uses `qwen2.5:3b` with strict JSON schema enforcement (`format="json"`).
4. **Prompt Hardening**: Filenames, metadata, and extracted snippets are explicitly treated as **untrusted user data**. The system prompt instructs the model that file contents cannot override instructions or execute commands. The model **proposes** changes; deterministic Python code validates boundaries and executes file operations.
5. **Path Traversal Protection & Collision Safety**: All target destinations are verified using `os.path.commonpath([root, dest]) == root`. Accidental overwrites are prevented by automatically generating non-colliding suffixes (`_1.ext`).
6. **SQLite History & Undo**: Operations are written to a local journal (`lazydesk_history.db`). A dedicated `undo_session` routine moves files back to their exact original paths.

---

## 5. Why Does Open Innovation Matter?

Open innovation is not just an alternative implementation; it is the fundamental reason LazyDesk AI can exist as a safe productivity tool:

1. **Privacy by Architecture**: Desktop decluttering requires reading your tax receipts, employment contracts, personal journals, and draft notes. Uploading these documents to proprietary cloud APIs creates significant privacy, compliance, and confidentiality liabilities. Local open-weight models keep your files strictly on your own device.
2. **User Sovereignty & Model Choice**: With Ollama and open weights, users are not captive to a single vendor's pricing or terms of service. You can run Qwen, Llama, Mistral, or Gemma, and switch between models freely.
3. **Zero Per-Token API Costs**: Cloud AI models charge per token, turning a 1,000-file cleanup into an expensive recurring subscription. Local inference runs for free on your existing hardware.
4. **True Offline Potential**: After pulling model weights once (`ollama pull qwen2.5:3b`), LazyDesk operates completely disconnected—on planes, trains, or in high-security air-gapped environments.
5. **Auditable Transparency**: The source code, prompts, schema validation, and filesystem operations can be inspected, tested, and audited by anyone.

---

## 6. The Lazy Payoff

Decluttering a typical workspace folder with 50-100 messy downloads usually requires 20-40 minutes of clicking, creating folders, renaming files, and opening PDFs to see what they contain.

With LazyDesk AI:
- **Scan & Duplicate Detection**: ~150 ms (local SHA-256).
- **AI Categorization & Filename Suggestion**: ~10-15 seconds on a standard computer.
- **Review & Execution**: 1 click.
- **Estimated Time Saved**: ~30 minutes per cleanup session, with zero cognitive friction and zero manual sorting.

---

## 7. Prize Categories

This project is submitted for:
- **Hacktoberfest Open-Source AI Challenge — Week 3: Slow and Steady**
  *Tagline: "Stay lazy. Get organized."*

---

*Built with passion, caffeine, and sloth-like patience during Hacktoberfest 2026.* 🦥
