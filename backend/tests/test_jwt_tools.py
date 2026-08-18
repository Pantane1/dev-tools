import base64
import json

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _b64url(data: dict) -> str:
    raw = json.dumps(data).encode()
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


def test_decode_jwt_without_verifying_signature():
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": "1234567890", "name": "Pantane", "iat": 1700000000}
    token = f"{_b64url(header)}.{_b64url(payload)}.fakesignature"

    resp = client.post("/api/jwt/decode", json={"token": token})
    assert resp.status_code == 200
    body = resp.json()
    assert body["subject"] == "1234567890"
    assert body["algorithm"] == "HS256"
    assert body["signature_verified"] is False


def test_decode_malformed_jwt_errors_cleanly():
    resp = client.post("/api/jwt/decode", json={"token": "not-a-jwt"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "INVALID_JWT"
