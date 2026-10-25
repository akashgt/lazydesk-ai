import os
import sys
import time
import webbrowser
import uvicorn
from pathlib import Path

def main():
    print("=" * 60)
    print(" 🦥 Starting LazyDesk AI — Your Digital Sloth Assistant")
    print(" Tagline: 'Stay lazy. Get organized.'")
    print("=" * 60)

    # Ensure sample workspace exists for risk-free exploration
    demo_dir = Path("sample_workspace")
    if not demo_dir.exists() or len(list(demo_dir.iterdir())) == 0:
        print("[*] Generating demo workspace with realistic sample documents...")
        from backend.demo_workspace import setup_demo_workspace
        setup_demo_workspace(demo_dir)
        print("[+] Demo workspace ready at: ./sample_workspace")

    # Check Ollama status
    print("[*] Checking local Ollama AI connection...")
    try:
        import httpx
        res = httpx.get("http://localhost:11434/api/tags", timeout=3.0)
        if res.status_code == 200:
            models = [m.get("name") for m in res.json().get("models", [])]
            print(f"[+] Ollama is ONLINE with models: {', '.join(models) if models else 'None pulled yet'}")
            if any("qwen2.5:3b" in m for m in models):
                print("[+] Default model 'qwen2.5:3b' is installed and ready for local inference.")
            else:
                print("[-] Warning: 'qwen2.5:3b' not detected. Run: `ollama pull qwen2.5:3b`")
        else:
            print("[-] Warning: Ollama returned non-200 status. Make sure `ollama serve` is running.")
    except Exception as e:
        print(f"[-] Warning: Ollama not reachable on http://localhost:11434 ({e}).")
        print("    LazyDesk will use deterministic offline heuristics until Ollama is launched.")

    url = "http://127.0.0.1:8000"
    print(f"\n[+] LazyDesk AI unified web application starting at: {url}")
    print("[+] Press Ctrl+C to shut down.")
    
    # Open browser automatically after a short delay
    def open_browser():
        time.sleep(1.2)
        webbrowser.open(url)

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    # Run Uvicorn serving backend API and built React frontend
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, log_level="info")

if __name__ == "__main__":
    main()
