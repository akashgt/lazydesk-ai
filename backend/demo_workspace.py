import os
import shutil
from pathlib import Path
import fitz  # PyMuPDF
import docx

def create_sample_pdf(file_path: Path, title: str, content: str):
    doc = fitz.open()
    page = doc.new_page()
    text = f"{title}\n\n{content}\n\nDate: October 2026\nConfidentiality: Internal Use Only"
    page.insert_text((50, 72), text, fontsize=12)
    doc.save(file_path)
    doc.close()

def create_sample_docx(file_path: Path, title: str, paragraphs: list[str]):
    doc = docx.Document()
    doc.add_heading(title, level=1)
    for p in paragraphs:
        doc.add_paragraph(p)
    doc.save(file_path)

def setup_demo_workspace(target_dir: Path) -> Path:
    """
    Creates or resets a realistic, fictional clutter workspace for safe exploration in Demo Mode.
    Contains documents, messy filenames, duplicates, and unorganized media.
    """
    target_dir.mkdir(parents=True, exist_ok=True)

    # 1. Financial Invoice (PDF)
    pdf_content = (
        "INVOICE #INV-2026-8891\n"
        "Vendor: Sloth Cloud Solutions LLC\n"
        "Client: Acme Corp\n"
        "Total Amount Due: $1,450.00 USD\n"
        "Payment Deadline: November 15, 2026\n"
        "Key Deliverables:\n"
        "- Automated folder indexing\n"
        "- Local AI inference gateway\n"
        "Action Items: Approve payment via ACH transfer by Nov 10, 2026."
    )
    inv1_path = target_dir / "Invoice_2026_Q1_draft (1).pdf"
    create_sample_pdf(inv1_path, "INVOICE - Q1 2026", pdf_content)

    # Duplicate of Invoice
    inv_dup = target_dir / "Invoice_2026_Q1_copy_backup.pdf"
    shutil.copy2(inv1_path, inv_dup)

    # 2. Project Meeting Notes (DOCX)
    notes_path = target_dir / "meeting_notes_october_unorganized.docx"
    create_sample_docx(
        notes_path,
        "Weekly Strategy Meeting Notes — October 25, 2026",
        [
            "Attendees: Alice, Bob, Charlie, Dana.",
            "Discussion: We evaluated local AI models versus proprietary cloud APIs. Privacy and zero-subscription costs are vital for our offline desktop tools.",
            "Action Item 1: Complete Hacktoberfest Week 3 LazyDesk release by October 31, 2026.",
            "Action Item 2: Test duplicate detector against SHA-256 hash sets.",
            "Key Takeaway: Local inference with qwen2.5:3b satisfies all performance metrics without uploading user data."
        ]
    )

    # 3. Product Roadmap (PDF)
    roadmap_path = target_dir / "product_roadmap_2026_vFinal (2).pdf"
    create_sample_pdf(
        roadmap_path,
        "LazyDesk AI 2026 Roadmap",
        "Vision: Transform personal digital decluttering through local open-weight intelligence.\n"
        "Milestones:\n"
        "- Q3 2026: Fast SHA-256 duplicate detection and safe file journaling.\n"
        "- Q4 2026: Multi-format summarization (PDF, DOCX, TXT, CSV).\n"
        "- Q1 2027: Cross-platform native desktop integration."
    )

    # 4. CSV Budget file
    csv_path = target_dir / "messy_budget_export_raw.csv"
    with open(csv_path, "w", encoding="utf-8") as f:
        f.write("Category,Item,Estimated_USD,Actual_USD,Notes\n")
        f.write("Infrastructure,Local AI Hardware,1200,1150,RTX Workstation\n")
        f.write("Software,Open-Source Tools,0,0,Zero API Cost\n")
        f.write("Marketing,Hacktoberfest Swag,250,220,Stickers and Pins\n")

    # Duplicate of CSV
    csv_dup = target_dir / "messy_budget_export_raw (Copy).csv"
    shutil.copy2(csv_path, csv_dup)

    # 5. Markdown Todo List
    md_path = target_dir / "daily_chores_random.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Sloth Daily Tasks 🦥\n\n")
        f.write("- [x] Wake up gently\n")
        f.write("- [x] Sip matcha green tea\n")
        f.write("- [ ] Run LazyDesk one-click cleanup on messy Downloads folder\n")
        f.write("- [ ] Review duplicate files and reclaim 500MB\n")
        f.write("- [ ] Celebrate Hacktoberfest Week 3 submission!\n")

    # 6. Sample Image Mockup / Asset
    png_path = target_dir / "screenshot_2026-10-25_at_14.02.11.png"
    # Create a small valid 1x1 PNG
    png_bytes = bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d400000000049454e44ae426082"
    )
    with open(png_path, "wb") as f:
        f.write(png_bytes)

    # Duplicate of the image
    png_dup = target_dir / "screenshot_2026-10-25_at_14.02.11 - Copy (1).png"
    shutil.copy2(png_path, png_dup)

    # 7. Code file
    code_path = target_dir / "scratch_analysis_script.py"
    with open(code_path, "w", encoding="utf-8") as f:
        f.write("# Temporary analysis helper\n")
        f.write("import os\nprint('Analyzing files with LazyDesk AI')\n")

    return target_dir
