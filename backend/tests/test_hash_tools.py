import hashlib

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_hash_text_matches_stdlib():
    resp = client.post("/api/hash/text", json={"content": "pantane", "algorithms": ["sha256", "md5"]})
    body = resp.json()
    results = {r["algorithm"]: r["hash"] for r in body["results"]}
    assert results["sha256"] == hashlib.sha256(b"pantane").hexdigest()
    assert results["md5"] == hashlib.md5(b"pantane").hexdigest()


def test_hash_text_rejects_unknown_algorithm():
    resp = client.post("/api/hash/text", json={"content": "x", "algorithms": ["sha3000"]})
    assert resp.status_code == 400
