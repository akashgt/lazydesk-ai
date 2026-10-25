# Security Policy for LazyDesk AI

## Security Principles & Threat Model

LazyDesk AI operates directly against local user filesystems and employs local AI inference. Because local productivity tools handle sensitive personal and professional documents, LazyDesk implements **Privacy and Security by Design**:

1. **Untrusted Data Boundary**:
   - Filenames, file metadata, and extracted document texts are treated as **untrusted data**.
   - Model prompt construction instructs the local model that document contents cannot override system instructions or issue commands.
   - Model outputs are validated through strict Pydantic schemas and deterministic application logic. The model **proposes** operations; native Python code **validates and executes** them.

2. **Strict Path Traversal Protection**:
   - Destination paths are strictly bounded using `os.path.commonpath([workspace_root, target_path]) == workspace_root`.
   - Any attempt to escape the workspace root using relative prefixes (`../`), absolute system paths (`C:\Windows`, `/etc/`), or symlinks is blocked before disk writes.

3. **Zero Accidental Overwrite Policy**:
   - If a target destination exists, `resolve_collision_path` generates safe auto-incremented filenames (`_1.ext`, `_2.ext`).
   - Original files are never deleted during cleanup. Files are moved into tidy subcategories within the user's chosen folder.

4. **Zero Cloud Telemetry**:
   - LazyDesk does not contain analytics, crash log uploaders, or remote tracking.
   - All network traffic is strictly between the application and the configured local Ollama endpoint (`http://localhost:11434`).

## Reporting a Vulnerability

If you discover a security vulnerability or path boundary issue:
1. Please do not open a public issue.
2. Email the maintainers with a detailed description and reproducible proof of concept.
3. We will acknowledge receipt within 48 hours and work with you on a coordinated fix.
