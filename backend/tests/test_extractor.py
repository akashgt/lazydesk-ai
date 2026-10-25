import pytest
import tempfile
from pathlib import Path
from backend.extractor import extract_document, chunk_text
from backend.demo_workspace import create_sample_pdf, create_sample_docx

def test_chunk_text():
    sample = "The quick brown fox jumps over the lazy dog. " * 50
    chunks = chunk_text(sample, max_chunk_chars=100)
    assert len(chunks) > 1
    assert all(len(c) <= 120 for c in chunks)

def test_extract_plain_text():
    with tempfile.TemporaryDirectory() as tmp_dir:
        p = Path(tmp_dir) / "notes.txt"
        p.write_text("Meeting discussion: Sloth productivity is awesome.", encoding="utf-8")
        
        doc = extract_document(p)
        assert doc.has_text is True
        assert doc.word_count == 6
        assert "Sloth productivity" in doc.extracted_text

def test_extract_pdf_and_docx():
    with tempfile.TemporaryDirectory() as tmp_dir:
        root = Path(tmp_dir)
        pdf_path = root / "sample.pdf"
        docx_path = root / "sample.docx"

        create_sample_pdf(pdf_path, "Invoice Oct 2026", "Total Due: $500.00")
        create_sample_docx(docx_path, "Notes", ["First paragraph", "Second paragraph"])

        pdf_doc = extract_document(pdf_path)
        assert pdf_doc.has_text is True
        assert "Invoice Oct 2026" in pdf_doc.extracted_text

        docx_doc = extract_document(docx_path)
        assert docx_doc.has_text is True
        assert "First paragraph" in docx_doc.extracted_text
