from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_generate_password_default_length():
    resp = client.post("/api/password/generate", json={"length": 20, "count": 3})
    body = resp.json()
    assert len(body["passwords"]) == 3
    assert all(len(p["password"]) == 20 for p in body["passwords"])


def test_generate_password_requires_a_charset():
    resp = client.post(
        "/api/password/generate",
        json={"uppercase": False, "lowercase": False, "numbers": False, "symbols": False},
    )
    assert resp.status_code == 422
