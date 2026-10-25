import os
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.config import settings
from backend.scanner import scan_directory, ScanResult
from backend.hasher import find_duplicate_files, DuplicateGroup
from backend.extractor import extract_document, ExtractedDocument
from backend.ai_service import ai_service, OllamaStatus, FileSuggestion, DocumentSummary
from backend.organizer import create_action_plan, execute_action_plan, ActionPlan, ExecutionResult
from backend.history import history_manager, SessionRecord, JournalRecord
from backend.demo_workspace import setup_demo_workspace

app = FastAPI(
    title="LazyDesk AI API",
    description="Privacy-first digital productivity assistant powered by local open-weight AI.",
    version="1.0.0",
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class ScanRequest(BaseModel):
    directory_path: str

class CategorizeRequest(BaseModel):
    directory_path: str
    files: List[Dict[str, Any]]

class PlanRequest(BaseModel):
    workspace_root: str
    suggestions: List[Dict[str, Any]]

class ExecuteRequest(BaseModel):
    action_plan: ActionPlan
    approved_action_ids: Optional[List[str]] = None
    task_type: str = "Smart Organizer"

class SummarizeRequest(BaseModel):
    file_path: str
    mode: str = "standard"  # "short", "standard", "detailed"

class ModelSelectRequest(BaseModel):
    model_name: str

class LazyModeRequest(BaseModel):
    directory_path: str
    include_summaries: bool = True
    max_summaries: int = 3

# Endpoints
@app.get("/api/health")
async def get_health():
    """Checks local system status and Ollama connectivity."""
    ollama_status = await ai_service.check_health()
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.version,
        "is_hosted_demo": settings.is_hosted_demo,
        "ollama": ollama_status.model_dump(),
    }

@app.post("/api/models/select")
async def select_model(req: ModelSelectRequest):
    """Switches the active local model."""
    ai_service.model = req.model_name
    status = await ai_service.check_health()
    return {"active_model": ai_service.model, "status": status.model_dump()}

@app.post("/api/scan", response_model=ScanResult)
async def scan_folder(req: ScanRequest):
    """Scans the specified folder and returns statistics, duplicates, and file tree."""
    if not req.directory_path.strip():
        raise HTTPException(status_code=400, detail="Directory path cannot be empty.")
    
    target_path = req.directory_path
    if settings.is_hosted_demo:
        # In hosted demo deployments, strictly sandbox file exploration to the demo workspace
        target_path = str(settings.hosted_workspace_dir.resolve())
        if not Path(target_path).exists():
            setup_demo_workspace(Path(target_path))

    result = scan_directory(target_path)
    if result.error:
        raise HTTPException(status_code=400, detail=result.error)
    return result

@app.post("/api/categorize")
async def categorize_files(req: CategorizeRequest):
    """Runs local open-weight AI categorization & renaming suggestions."""
    # Pre-extract brief text snippets for text/document files
    enriched_items = []
    for f in req.files:
        path_str = f.get("path")
        ext = f.get("extension", "").lower()
        snippet = ""
        if path_str and ext in settings.document_extensions | settings.code_extensions:
            try:
                extracted = extract_document(Path(path_str))
                snippet = (extracted.extracted_text or "")[:400]
            except Exception:
                pass
        
        item = dict(f)
        item["snippet"] = snippet
        enriched_items.append(item)

    suggestions = await ai_service.categorize_and_rename_batch(enriched_items)
    return [s.model_dump() for s in suggestions]

@app.post("/api/plan", response_model=ActionPlan)
async def generate_plan(req: PlanRequest):
    """Generates a validated dry-run action plan with collision avoidance."""
    return create_action_plan(req.workspace_root, req.suggestions)

@app.post("/api/execute", response_model=ExecutionResult)
async def execute_plan(req: ExecuteRequest):
    """Safely executes user-approved operations and journals results."""
    result = execute_action_plan(req.action_plan, req.approved_action_ids)
    
    # Record to SQLite history
    journal_actions = [
        {
            "source_path": a.source_path,
            "destination_path": a.destination_path,
            "status": a.status,
        }
        for a in result.actions
    ]
    history_manager.record_session(
        session_id=result.session_id,
        task_type=req.task_type,
        workspace_path=result.workspace_root,
        files_analyzed=result.total_requested,
        suggestions_count=result.total_requested,
        executed_count=result.succeeded_count,
        failed_count=result.failed_count,
        skipped_count=result.skipped_count,
        journal_actions=journal_actions,
    )
    return result

@app.post("/api/extract", response_model=ExtractedDocument)
async def extract_file(req: SummarizeRequest):
    """Extracts text content and metadata from a supported document."""
    file_p = Path(req.file_path)
    if not file_p.exists():
        raise HTTPException(status_code=404, detail="File does not exist.")
    return extract_document(file_p)

@app.post("/api/summarize", response_model=DocumentSummary)
async def summarize_file(req: SummarizeRequest):
    """Extracts text from a document and generates an AI summary with key takeaways."""
    file_p = Path(req.file_path)
    if not file_p.exists():
        raise HTTPException(status_code=404, detail="File does not exist.")

    extracted = extract_document(file_p)
    if extracted.error and not extracted.has_text:
        raise HTTPException(status_code=400, detail=extracted.error)

    summary = await ai_service.summarize_document(
        file_path=str(file_p),
        file_name=file_p.name,
        text=extracted.extracted_text,
        mode=req.mode,
    )
    return summary

@app.post("/api/lazy-mode")
async def run_lazy_mode(req: LazyModeRequest):
    """
    Lazy Mode: 
    1. Scans folder.
    2. Detects duplicates.
    3. Runs AI categorization for all files.
    4. Summarizes top supported documents.
    5. Builds consolidated action plan waiting for user review & approval.
    """
    scan_res = scan_directory(req.directory_path)
    if scan_res.error:
        raise HTTPException(status_code=400, detail=scan_res.error)

    # 2. Enrich and run AI categorization
    enriched_items = []
    supported_docs_for_summary = []

    for f in scan_res.files:
        f_dict = f.model_dump()
        snippet = ""
        if f.can_extract_text:
            try:
                extracted = extract_document(Path(f.path))
                snippet = (extracted.extracted_text or "")[:400]
                if extracted.has_text and len(supported_docs_for_summary) < req.max_summaries:
                    supported_docs_for_summary.append((f, extracted))
            except Exception:
                pass
        f_dict["snippet"] = snippet
        enriched_items.append(f_dict)

    suggestions = await ai_service.categorize_and_rename_batch(enriched_items)
    
    # 3. Create dry-run action plan
    action_plan = create_action_plan(
        req.directory_path,
        [s.model_dump() for s in suggestions]
    )

    # 4. Generate summaries for top documents if requested
    summaries = []
    if req.include_summaries:
        for f, extracted in supported_docs_for_summary:
            try:
                sum_res = await ai_service.summarize_document(
                    file_path=f.path,
                    file_name=f.name,
                    text=extracted.extracted_text,
                    mode="standard"
                )
                summaries.append(sum_res.model_dump())
            except Exception:
                pass

    return {
        "scan": scan_res.model_dump(),
        "suggestions": [s.model_dump() for s in suggestions],
        "action_plan": action_plan.model_dump(),
        "summaries": summaries,
        "duplicates": [d.model_dump() for d in scan_res.duplicates],
        "status": "ready_for_review"
    }

@app.get("/api/history", response_model=List[SessionRecord])
async def get_history(limit: int = 50):
    """Returns past activity sessions."""
    return history_manager.list_sessions(limit=limit)

@app.get("/api/history/{session_id}/journal", response_model=List[JournalRecord])
async def get_journal(session_id: str):
    """Returns detailed file operations for a specific session."""
    return history_manager.get_session_journal(session_id)

@app.post("/api/history/{session_id}/undo")
async def undo_session(session_id: str):
    """Reverses all executed operations in a session."""
    res = history_manager.undo_session(session_id)
    if not res.get("success") and res.get("failed_count", 0) > 0 and res.get("reversed_count", 0) == 0:
        raise HTTPException(status_code=400, detail=res.get("message") or "Failed to undo operations.")
    return res

@app.delete("/api/history")
async def clear_history():
    """Clears all session and journal records."""
    history_manager.clear_history()
    return {"message": "History cleared successfully."}

@app.post("/api/demo/reset")
async def reset_demo_workspace():
    """Generates a clean demo workspace with sample documents and duplicates."""
    cwd = Path.cwd()
    demo_dir = cwd / "sample_workspace"
    setup_demo_workspace(demo_dir)
    return {
        "message": "Demo workspace successfully prepared.",
        "path": str(demo_dir.resolve()),
        "is_demo": True,
    }

@app.get("/api/picker")
async def get_picker_suggestions():
    """Provides common directory paths and opens folder dialog if available."""
    cwd = Path.cwd()
    demo_dir = cwd / "sample_workspace"
    desktop_dir = Path.home() / "Desktop"
    downloads_dir = Path.home() / "Downloads"
    docs_dir = Path.home() / "Documents"

    if settings.is_hosted_demo:
        return {"suggestions": [{"name": "Sample Workspace (Hosted Sandbox)", "path": str(demo_dir.resolve())}]}

    suggestions = [
        {"name": "Sample Workspace (Demo)", "path": str(demo_dir.resolve())},
        {"name": "Current Workspace", "path": str(cwd.resolve())},
    ]
    if downloads_dir.exists():
        suggestions.append({"name": "Downloads", "path": str(downloads_dir.resolve())})
    if docs_dir.exists():
        suggestions.append({"name": "Documents", "path": str(docs_dir.resolve())})
    if desktop_dir.exists():
        suggestions.append({"name": "Desktop", "path": str(desktop_dir.resolve())})

    return {"suggestions": suggestions}

# Mount static files if frontend build exists
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists() and frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
