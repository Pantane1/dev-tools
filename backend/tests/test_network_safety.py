import pytest

from app.core.errors import AppError
from app.core.network_safety import resolve_and_validate_host


def test_rejects_localhost_by_name():
    with pytest.raises(AppError) as exc:
        resolve_and_validate_host("localhost")
    assert exc.value.code == "UNSAFE_TARGET"


def test_rejects_loopback_ip(monkeypatch):
    monkeypatch.setattr(
        "socket.getaddrinfo",
        lambda *a, **k: [(2, 1, 6, "", ("127.0.0.1", 0))],
    )
    with pytest.raises(AppError) as exc:
        resolve_and_validate_host("evil.example")
    assert exc.value.code == "UNSAFE_TARGET"


def test_rejects_metadata_ip(monkeypatch):
    monkeypatch.setattr(
        "socket.getaddrinfo",
        lambda *a, **k: [(2, 1, 6, "", ("169.254.169.254", 0))],
    )
    with pytest.raises(AppError) as exc:
        resolve_and_validate_host("metadata.example")
    assert exc.value.code == "UNSAFE_TARGET"


def test_allows_public_ip(monkeypatch):
    monkeypatch.setattr(
        "socket.getaddrinfo",
        lambda *a, **k: [(2, 1, 6, "", ("93.184.216.34", 0))],
    )
    ips = resolve_and_validate_host("example.com")
    assert ips == ["93.184.216.34"]


def test_dns_failure_raises_clean_error(monkeypatch):
    import socket as socket_module

    def raise_gaierror(*a, **k):
        raise socket_module.gaierror("nope")

    monkeypatch.setattr("socket.getaddrinfo", raise_gaierror)
    with pytest.raises(AppError) as exc:
        resolve_and_validate_host("doesnotresolve.example")
    assert exc.value.code == "DNS_RESOLUTION_FAILED"