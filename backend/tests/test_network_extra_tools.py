from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from app.core.errors import AppError
from app.main import app

client = TestClient(app)


# --- Port Checker ---
@patch("app.services.port_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("socket.create_connection")
def test_port_check_open(mock_connect, _mock_safety):
    mock_connect.return_value.__enter__.return_value = MagicMock()
    resp = client.get("/api/port/check", params={"host": "example.com", "port": 443})
    body = resp.json()
    assert body["open"] is True
    assert body["response_time_ms"] is not None


@patch("app.services.port_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("socket.create_connection", side_effect=ConnectionRefusedError())
def test_port_check_closed(mock_connect, _mock_safety):
    resp = client.get("/api/port/check", params={"host": "example.com", "port": 9999})
    body = resp.json()
    assert body["open"] is False
    assert body["response_time_ms"] is None


@patch(
    "app.services.port_service.resolve_and_validate_host",
    side_effect=AppError("UNSAFE_TARGET", "This host isn't allowed.", status_code=400),
)
def test_port_check_rejects_private_host(_mock_safety):
    resp = client.get("/api/port/check", params={"host": "192.168.1.1", "port": 22})
    assert resp.status_code == 400


# --- Ping ---
@patch("app.services.ping_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("socket.create_connection")
def test_ping_reports_stats(mock_connect, _mock_safety):
    mock_connect.return_value.__enter__.return_value = MagicMock()
    resp = client.get("/api/ping/check", params={"host": "example.com", "port": 443})
    body = resp.json()
    assert len(body["attempts"]) == 4
    assert body["packet_loss_percent"] == 0
    assert body["avg_ms"] is not None


# --- WHOIS ---
@patch("httpx.get")
def test_whois_lookup_parses_registrar(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "events": [
            {"eventAction": "registration", "eventDate": "2010-01-01T00:00:00Z"},
            {"eventAction": "expiration", "eventDate": "2030-01-01T00:00:00Z"},
        ],
        "status": ["active"],
        "nameservers": [{"ldhName": "ns1.example.com"}, {"ldhName": "ns2.example.com"}],
        "entities": [{"roles": ["registrar"], "vcardArray": ["vcard", [["fn", {}, "text", "Example Registrar"]]]}],
    }
    mock_get.return_value = mock_response

    resp = client.get("/api/whois/lookup", params={"domain": "example.com"})
    body = resp.json()
    assert body["registrar"] == "Example Registrar"
    assert body["created"] == "2010-01-01T00:00:00Z"
    assert "ns1.example.com" in body["name_servers"]


def test_whois_lookup_rejects_invalid_domain():
    resp = client.get("/api/whois/lookup", params={"domain": "not a domain!!"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "INVALID_DOMAIN"


@patch("httpx.get")
def test_whois_lookup_handles_not_found(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_get.return_value = mock_response

    resp = client.get("/api/whois/lookup", params={"domain": "definitely-not-registered-xyz123.com"})
    assert resp.status_code == 404


# --- IP ownership lookup ---
@patch("httpx.get")
def test_ip_lookup_parses_organization(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "name": "GOOGLE",
        "country": "US",
        "startAddress": "8.8.8.0",
        "endAddress": "8.8.8.255",
        "entities": [{"vcardArray": ["vcard", [["fn", {}, "text", "Google LLC"]]]}],
    }
    mock_get.return_value = mock_response

    resp = client.get("/api/ip-lookup/lookup", params={"ip": "8.8.8.8"})
    body = resp.json()
    assert body["organization"] == "Google LLC"
    assert body["country"] == "US"


def test_ip_lookup_rejects_private_ip():
    resp = client.get("/api/ip-lookup/lookup", params={"ip": "192.168.1.1"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "UNSAFE_TARGET"
