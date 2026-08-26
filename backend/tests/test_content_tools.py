import io

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


# --- Markdown ---
def test_markdown_renders_basic_syntax():
    resp = client.post("/api/markdown/preview", json={"content": "# Hello\n\n**bold** and *em*"})
    body = resp.json()
    assert "<h1>Hello</h1>" in body["html"]
    assert "<strong>bold</strong>" in body["html"]


def test_markdown_strips_script_tags():
    resp = client.post("/api/markdown/preview", json={"content": "<script>alert(1)</script>\n\n# Safe"})
    body = resp.json()
    assert "<script>" not in body["html"]
    assert "<h1>Safe</h1>" in body["html"]


def test_markdown_renders_tables():
    resp = client.post("/api/markdown/preview", json={"content": "| a | b |\n|---|---|\n| 1 | 2 |"})
    assert "<table>" in resp.json()["html"]


# --- Image metadata ---
def _make_test_image() -> bytes:
    img = Image.new("RGB", (64, 32), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_image_metadata_extracts_dimensions():
    image_bytes = _make_test_image()
    resp = client.post(
        "/api/image-metadata/extract",
        files={"file": ("test.png", image_bytes, "image/png")},
    )
    body = resp.json()
    assert body["width"] == 64
    assert body["height"] == 32
    assert body["format"] == "PNG"
    assert body["has_gps_data"] is False


def test_image_metadata_rejects_non_image():
    resp = client.post(
        "/api/image-metadata/extract",
        files={"file": ("not-an-image.txt", b"just some text", "text/plain")},
    )
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "INVALID_IMAGE"
