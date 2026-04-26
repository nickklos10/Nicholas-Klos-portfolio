import pytest

from app.tools.surface_projects import SurfaceProjectsTool


async def test_surface_projects_validates_ids():
    tool = SurfaceProjectsTool()
    out = await tool.run({"ids": ["f1gpt", "serie-a"]})
    assert out["ok"] is True
    assert out["ids"] == ["f1gpt", "serie-a"]


async def test_surface_projects_rejects_more_than_three():
    tool = SurfaceProjectsTool()
    with pytest.raises(ValueError):
        await tool.run({"ids": ["a", "b", "c", "d"]})
