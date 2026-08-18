import re

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")


def test_generate_uuid_v4_shape():
    resp = client.post("/api/uuid/generate", json={"count": 5})
    body = resp.json()
    assert len(body["uuids"]) == 5
    assert all(UUID_RE.match(u) for u in body["uuids"])


def test_generate_uuid_without_hyphens():
    resp = client.post("/api/uuid/generate", json={"count": 1, "hyphens": False})
    value = resp.json()["uuids"][0]
    assert "-" not in value
    assert len(value) == 32
