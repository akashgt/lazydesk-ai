import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "LazyDesk AI"
    version: str = "1.0.0"
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    default_model: str = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
    db_path: Path = Path(os.getenv("LAZYDESK_DB", "lazydesk_history.db"))
    
    # Supported file extensions by category
    document_extensions: set[str] = {".pdf", ".docx", ".txt", ".md", ".csv", ".xlsx", ".pptx", ".rtf", ".odt"}
    image_extensions: set[str] = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".tiff", ".ico"}
    archive_extensions: set[str] = {".zip", ".tar", ".gz", ".7z", ".rar", ".bz2"}
    code_extensions: set[str] = {".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".yaml", ".yml", ".sql", ".sh"}
    audio_video_extensions: set[str] = {".mp3", ".wav", ".flac", ".mp4", ".mov", ".avi", ".mkv"}
    
    # Files/folders to always skip for safety
    skip_directories: set[str] = {
        ".git", ".svn", ".hg", "node_modules", "__pycache__", ".venv", "venv",
        ".gemini", ".idea", ".vscode", "System Volume Information", "$RECYCLE.BIN"
    }
    skip_files: set[str] = {
        "desktop.ini", "thumbs.db", ".ds_store", "package-lock.json", "lazydesk_history.db"
    }
    
    # Extraction safety limits
    max_extract_size_bytes: int = 15 * 1024 * 1024  # 15 MB
    max_chunk_chars: int = 3500

settings = Settings()
