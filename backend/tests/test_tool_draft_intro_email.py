from app.tools.draft_intro_email import DraftIntroEmailTool


async def test_draft_intro_email_returns_subject_and_body():
    tool = DraftIntroEmailTool()
    out = await tool.run(
        {"subject": "Quick intro — open role", "body": "Hi Nicholas,\n\nI saw your portfolio..."}
    )
    assert out["subject"].startswith("Quick intro")
    assert out["body"].startswith("Hi Nicholas")
    assert out["mailto"].startswith("mailto:nicholask39@gmail.com")
