import pytest
from backend.ai_service import AIService

@pytest.mark.asyncio
async def test_ai_offline_fallback():
    # Point to an invalid unreachable port
    service = AIService(base_url="http://localhost:59999", model="non_existent_model")
    
    health = await service.check_health()
    assert health.is_reachable is False
    assert health.model_available is False
    assert "Cannot connect" in health.error_message

    # Test categorization fallback
    items = [
        {"name": "financial_report.pdf", "path": "/test/financial_report.pdf", "category": "Documents"},
        {"name": "vacation.png", "path": "/test/vacation.png", "category": "Images & Media"}
    ]
    suggestions = await service.categorize_and_rename_batch(items)
    assert len(suggestions) == 2
    assert suggestions[0].validation_status == "fallback"
    assert suggestions[0].proposed_category == "Documents"
    assert suggestions[1].proposed_category == "Images & Media"

    # Test summarization fallback
    summary = await service.summarize_document(
        file_path="/test/doc.txt",
        file_name="doc.txt",
        text="This is an automated report summary. It has details.",
        mode="standard"
    )
    assert "doc.txt" in summary.file_name
    assert "Automated extract" in summary.summary
