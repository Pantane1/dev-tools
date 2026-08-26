from unittest.mock import MagicMock, patch

import httpx
from fastapi.testclient import TestClient
from app.core.errors import AppError
from app.main import app

client = TestClient(app)


@patch("app.services.headers_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("httpx.Client.get")
def test_headers_check_scores_present_headers(mock_get, _mock_safety):
    mock_response = MagicMock(spec=httpx.Response)
    mock_response.status_code = 200
    mock_response.url = "https://example.com/"
    mock_response.headers = {
        "Strict-Transport-Security": "max-age=63072000",
        "X-Content-Type-Options": "nosniff",
    }
    mock_get.return_value = mock_response

    resp = client.post("/api/headers/check", json={"url": "example.com"})
    assert resp.status_code == 200
    body = resp.json()
    hsts = next(c for c in body["checks"] if c["name"] == "Strict-Transport-Security")
    csp = next(c for c in body["checks"] if c["name"] == "Content-Security-Policy")
    assert hsts["present"] is True
    assert csp["present"] is False
    assert 0 < body["score"] < 100


@patch(
    "app.services.headers_service.resolve_and_validate_host",
    side_effect=AppError("UNSAFE_TARGET", "This host isn't allowed.", status_code=400),
)
def test_headers_check_rejects_unsafe_target(_mock_safety):
    resp = client.post("/api/headers/check", json={"url": "http://localhost:8000/admin"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "UNSAFE_TARGET"
