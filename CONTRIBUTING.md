# Contributing to LazyDesk AI 🦥

Thank you for your interest in contributing to **LazyDesk AI**! We welcome bug reports, feature suggestions, documentation enhancements, and pull requests.

## Philosophy: "Slow and Steady"

LazyDesk is built on the philosophy of the sloth:
- Keep automation simple, calm, and reliable.
- Never prioritize speed over privacy or filesystem safety.
- Keep dependencies lean and transparent.

## Development Setup

### Prerequisites
1. **Python 3.10+**: Ensure `pip` is available.
2. **Node.js 18+**: For building the React frontend.
3. **Ollama**: Installed locally from [ollama.com](https://ollama.com).
   - Start Ollama: `ollama serve`
   - Download the default model: `ollama pull qwen2.5:3b`

### Setup Steps
```bash
# Clone the repository
git clone https://github.com/your-username/lazydesk-ai.git
cd lazydesk-ai

# Install Python requirements
pip install fastapi uvicorn pymupdf python-docx pydantic httpx pytest pytest-asyncio

# Install Frontend dependencies and build
npm install
npm run build

# Start the full application
python run.py
```

## Running Automated Tests

We maintain high test coverage for all filesystem operations, duplicate detection, and security rules:

```bash
# Run backend pytest suite
python -m pytest backend/tests -v
```

All 11 tests must pass before submitting a PR.

## Security & Filesystem Rules

When adding new file operations:
1. **Never delete user files** as part of normal operations.
2. **Always validate path safety** using `validate_path_safety` to prevent path traversal attacks.
3. **Handle collisions gracefully** using `resolve_collision_path`.
4. **Log every executed operation** in the SQLite history journal for reversible 1-click Undo.
5. **Never require cloud API keys** for core functionality. Local inference is a first-class citizen.

## Pull Request Guidelines

1. Create a feature branch: `git checkout -b feature/my-cool-feature`.
2. Follow strict TypeScript types and Python type hints.
3. Write automated unit tests for new logic.
4. Verify tests pass: `pytest backend/tests`.
5. Open a pull request with a clear description of changes.
