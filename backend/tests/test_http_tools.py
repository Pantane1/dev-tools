from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from app.core.errors import AppError
from app.main import app

client = TestClient(app)


@patch("app.services.http_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("app.services.http_service._execute_request")
def test_get_request_returns_response(mock_execute, _mock_safety):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.reason_phrase = "OK"
    mock_response.headers = {"content-type": "application/json"}
    mock_response.content = b'{"ok": true}'
    mock_execute.return_value = mock_response

    resp = client.post("/api/http/request", json={"method": "GET", "url": "https://example.com/api"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["status_code"] == 200
    assert body["body_is_json"] is True
    assert '"ok": true' in body["body"]


@patch(
    "app.services.http_service.resolve_and_validate_host",
    side_effect=AppError("UNSAFE_TARGET", "This host isn't allowed.", status_code=400),
)
def test_rejects_private_target(_mock_safety):
    resp = client.post("/api/http/request", json={"method": "GET", "url": "http://192.168.1.1/admin"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "UNSAFE_TARGET"


def test_rejects_non_http_scheme():
    resp = client.post("/api/http/request", json={"method": "GET", "url": "ftp://example.com"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "INVALID_URL"


@patch("app.services.http_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("app.services.http_service._execute_request")
def test_host_header_is_stripped(mock_execute, _mock_safety):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.reason_phrase = "OK"
    mock_response.headers = {}
    mock_response.content = b"ok"
    mock_execute.return_value = mock_response

    client.post(
        "/api/http/request",
        json={"method": "GET", "url": "https://example.com", "headers": {"Host": "evil.internal", "X-Test": "1"}},
    )
    sent_kwargs = mock_execute.call_args[0][0]
    assert "Host" not in sent_kwargs["headers"]
    assert sent_kwargs["headers"]["X-Test"] == "1"