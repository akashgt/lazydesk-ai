*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

# LazyDesk AI 🦥
### *Stay lazy. Get organized.*

---

## What I Built

Most people's computers have at least one terrifying directory—usually `Downloads` or `Desktop`—filled with chaotic files like:
- `Invoice_2026_Q1_draft (1).pdf`
- `Screenshot 2026-10-25 at 14.02.11.png`
- `Untitled_notes_final_v2.docx`
- `expenses_backup (copy).xlsx`

Sorting through these files manually is tedious, repetitive, and mentally draining. You have to open every PDF just to figure out what company it's from, manually create folders, think of consistent filenames, and spot identical duplicates taking up space.

Inspired by the philosophy of the sloth—**"do less manual work and let automation handle the boring chores"**—I built **LazyDesk AI**. 

LazyDesk AI is a privacy-first, desktop-class digital productivity assistant that:
1. **Scans cluttered directories** safely without touching system folders.
2. **Finds exact duplicate files** using fast size-filtered SHA-256 hashing and calculates reclaimable storage.
3. **Categorizes files & suggests standardized filenames** using **Google Gemma 2 (`gemma2:2b`)** open weights.
4. **Extracts executive document summaries** from PDFs, Word docs, and Markdown with 5 key takeaways, deadlines, and action items.
5. **Stages everything in a unified Action Plan** with interactive approvals before touching a single byte on disk.
6. **Journals all operations in SQLite** with **1-Click Undo** to reverse file movements instantly if you change your mind.

### Who gets to be a little lazier because of it?
Anyone drowning in a messy Downloads, Documents, or Desktop folder—students, freelancers, developers, researchers, and remote workers who want a clean, organized digital workspace without spending Sunday afternoon dragging icons into folders.

---

## Demo

### 🎥 Walkthrough Video & Visual Showcase
A complete visual demo showing the warm ivory interface, sloth mascot moods, 1-click **Lazy Mode**, duplicate detection, and Gemma 2 document summarization:

```
Recorded Walkthrough:
lazydesk_demo_1792937463412.webp (Included in project assets)
```

### ⚡ Quick Run (Local Desktop)
Run LazyDesk AI locally on your computer with your own files or the built-in zero-risk sample workspace:

```bash
# 1. Clone the repository
git clone https://github.com/akashgt/lazydesk-ai.git
cd lazydesk-ai

# 2. Pull Google Gemma 2 via Ollama (1.6 GB open weights)
ollama pull gemma2:2b

# 3. Install dependencies & run
pip install -r requirements.txt
python run.py
```
LazyDesk AI will launch the unified FastAPI server and automatically open your browser to **`http://127.0.0.1:8000/`**.

### ☁️ Cloud Hosted Demo (Render)
LazyDesk AI is also configured with a **Render Blueprint (`render.yaml`)** and multi-stage `Dockerfile` with a **sandboxed demo mode (`HOSTED_DEMO=true`)**. In hosted demo mode, directory browsing is strictly constrained to synthetic sample documents so web visitors can safely test all features without risking host server security.

---

## Code

{% github akashgt/lazydesk-ai %}

- **GitHub Repository**: [https://github.com/akashgt/lazydesk-ai](https://github.com/akashgt/lazydesk-ai)
- **License**: MIT License (Application) • Google Gemma Terms of Use (Gemma 2 Model)
- **Tech Stack**:
  - **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
  - **Design System**: Custom "Warm Ivory" theme (`#FAF8F5`) with deep forest green accents (`#1B4332`), soft sage cards, and expressive sloth mascots.
  - **Backend**: FastAPI, Uvicorn, PyMuPDF (`fitz`), `python-docx`, SQLite, Pydantic v2.
  - **Local AI Engine**: Google Gemma 2 2B via Ollama HTTP Gateway.
  - **Cloud Infrastructure**: Render Blueprint (`render.yaml`), multi-stage Docker container, `/api/health`.

---

## How I Built It

LazyDesk AI was built from the ground up around strict privacy, deterministic safety boundaries, and local open-weight AI.

### 1. Local AI Engine: Google Gemma 2 2B (`gemma2:2b`)
Rather than relying on proprietary cloud APIs, LazyDesk uses Google's open-weight **Gemma 2 2B (`gemma2:2b`)** running locally through Ollama:
- **Fast, Bounded Inference**: We tuned the Ollama gateway with bounded parameters (`num_ctx: 1536`, `num_predict: 380`, `temperature: 0.1`, `timeout: 100.0s`). This ensures deterministic JSON generation and snappy execution on standard consumer CPUs and laptops.
- **Strict JSON Schema Prompts**: Prompts include explicit JSON schemas and concrete output demonstrations. Responses are parsed and validated against strict Pydantic schemas.
- **Flexible Model Adapter**: The architecture preserves user sovereignty with a hot-swappable model adapter. Users can switch between `gemma2:2b`, `qwen2.5:3b`, `llama3.2:3b`, or any installed Ollama model directly from the UI settings.

### 2. Prompt Hardening & Untrusted Data Boundary
A key design principle: **document contents and filenames are untrusted data**.
- System prompts explicitly instruct the model that document text and filenames cannot override instructions, inject commands, or alter system behavior.
- The model only **proposes** suggestions; pure deterministic Python code validates boundaries, checks path safety, and executes moves.

### 3. Path Traversal Defense & Collision Avoidance
- Target paths are validated using:
  ```python
  if os.path.commonpath([resolved_root, resolved_dest]) != resolved_root:
      raise SecurityException("Path traversal attempt blocked")
  ```
- Operations can never escape the selected directory.
- Accidental file overwrites are impossible: a collision resolver checks if a target filename exists and automatically increments it (`invoice_1.pdf`) non-destructively.

### 4. SQLite Safety Journal & 1-Click Rollback
Every file move is logged into an ACID-compliant SQLite journal (`lazydesk_history.db`) with source, destination, timestamp, and status. Clicking **Undo Last Session** walks backwards through the journal and restores all files to their exact original locations.

### 5. Render Cloud Blueprint & Multi-Stage Docker
To support cloud demonstration on Render:
- **`render.yaml` Blueprint**: Configures a Web Service running on Render's Docker environment with automatic health checks (`/api/health`) and dynamic port binding (`$PORT`).
- **Multi-Stage `Dockerfile`**: Uses Node 20 to compile the React frontend into static assets, then packages the FastAPI backend into a slim Python 3.11 container.
- **Hosted Demo Sandboxing**: When `HOSTED_DEMO=true` is set, all file operations are strictly restricted to the synthetic `sample_workspace/` directory.

---

## Why Does Open Innovation Matter?

Open innovation is not just an alternative implementation detail for LazyDesk AI—**it is the reason the application can ethically exist**:

1. **Privacy by Architecture**: Desktop decluttering operates on your personal tax returns, medical bills, employment contracts, and private journals. Sending these confidential files across the internet to closed proprietary APIs creates massive privacy and compliance risks. Open-weight models like Gemma 2 keep private data 100% on your device.
2. **Zero Per-Token Bills**: Cleaning up 500 messy files or extracting summaries from twenty 30-page PDFs with closed APIs burns through tokens and demands recurring subscriptions. With local open innovation, intelligence is free and unlimited after downloading model weights.
3. **True Offline Resilience**: LazyDesk AI runs on airplanes, remote cabins, high-speed trains, or in air-gapped secure corporate facilities with zero internet access.
4. **User Sovereignty & No Vendor Lock-in**: If a closed API changes its pricing, deprecates an endpoint, or alters its content filters, apps break. With open weights, you own your tools and can inspect, modify, and run them indefinitely.

---

## My Agent Session

This project was built pair-programming with the **Antigravity AI Agent** (Gemini 2.5 Flash / Pro):
- The agent assisted across the full stack: architecting the FastAPI scanner, creating the warm ivory UI with vector sloth mascot illustrations, optimizing size-filtered SHA-256 duplicate detection, resolving Node 26 npm class-extension compatibility, testing real local Gemma 2 inference, and writing the Render deployment blueprint.
- All 11 backend unit tests, frontend Vite builds, and live browser sessions were executed and verified directly within the Antigravity IDE workspace.

---

## The Lazy Payoff

Decluttering a typical workspace folder with 50-100 messy downloads usually requires 20-40 minutes of clicking, creating folders, opening PDFs to see what they contain, and manually renaming files.

With LazyDesk AI:
- **Scan & Duplicate Detection**: ~150 ms (local SHA-256 with byte-size pre-filtering).
- **AI Categorization & Filename Suggestion**: ~10-15 seconds for batch processing.
- **Review & Execution**: 1 click to apply the staged Action Plan.
- **Undo**: 1 click if you change your mind.
- **Estimated Time Saved**: **~30 minutes per cleanup session**, saving mental energy and eliminating digital clutter with zero effort.

---

## Prize Categories

This project is entered into the following challenge tracks:

### 🦥 1. Hacktoberfest Open-Source AI Challenge — Week 3: Slow and Steady
*“Stay lazy. Get organized.”* Built to embody the sloth philosophy: automate tedious digital chores with local AI so humans can do less manual busywork.

### 💎 2. Best Use of Gemma (Google Gemma Partner Prize)
- Integrates Google's open-weight **Gemma 2 2B (`gemma2:2b`)** as the default local AI engine via Ollama.
- Uses real local Gemma 2 inference to categorize files into 7 intuitive groups, propose clean standardized filenames, and generate 5-bullet executive document summaries with deadlines and action items.
- Features bounded contexts (`num_ctx: 1536`), deterministic JSON schemas, live model health diagnostics, and full compliance with the Google Gemma Terms of Use.

### 🚀 3. Best Use of Render (Render Partner Prize)
- Includes a complete Infrastructure-as-Code **Render Blueprint (`render.yaml`)** and multi-stage container build ([`Dockerfile`](Dockerfile)).
- Implements automated zero-downtime health checking via `/api/health` and dynamic `$PORT` handling.
- Features a secure **Hosted Demo Mode (`HOSTED_DEMO=true`)** that automatically sandboxes web visitors inside synthetic sample workspaces, proving that local-first desktop productivity apps can be showcased securely in the cloud on Render.

---

*Stay lazy. Get organized with LazyDesk AI.* 🦥
