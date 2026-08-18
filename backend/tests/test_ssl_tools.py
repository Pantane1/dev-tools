from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


FAKE_CERT = {
    "issuer": ((("commonName", "R3"),), (("organizationName", "Let's Encrypt"),)),
    "subject": ((("commonName", "example.com"),),),
    "subjectAltName": [("DNS", "example.com"), ("DNS", "www.example.com")],
    "notBefore": "Jan  1 00:00:00 2026 GMT",
    "notAfter": "Dec 31 23:59:59 2026 GMT",
}


@patch("app.services.ssl_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("socket.create_connection")
@patch("ssl.SSLContext.wrap_socket")
def test_ssl_check_returns_cert_info(mock_wrap, mock_connect, _mock_safety):
    mock_tls_sock = MagicMock()
    mock_tls_sock.getpeercert.return_value = FAKE_CERT
    mock_tls_sock.version.return_value = "TLSv1.3"
    mock_wrap.return_value.__enter__.return_value = mock_tls_sock
    mock_connect.return_value.__enter__.return_value = MagicMock()

    resp = client.get("/api/ssl/check", params={"domain": "example.com"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["issuer"].startswith("commonName=R3")
    assert "example.com" in body["san"]
    assert body["tls_version"] == "TLSv1.3"