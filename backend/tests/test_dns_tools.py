from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from app.core.errors import AppError
from app.main import app

client = TestClient(app)


def _fake_rrset(ttl=300):
    rrset = MagicMock()
    rrset.ttl = ttl
    return rrset


@patch("app.services.dns_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("app.services.dns_service._resolver")
def test_dns_lookup_returns_records(mock_resolver_factory, _mock_safety):
    mock_resolver = MagicMock()
    mock_resolver_factory.return_value = mock_resolver

    def resolve_side_effect(domain, rtype):
        if rtype == "A":
            answer = [MagicMock(__str__=lambda self: "93.184.216.34")]
            fake = MagicMock()
            fake.__iter__ = lambda self: iter(answer)
            fake.rrset = _fake_rrset()
            return fake
        raise __import__("dns.resolver", fromlist=["NoAnswer"]).NoAnswer()

    mock_resolver.resolve.side_effect = resolve_side_effect

    resp = client.get("/api/dns/lookup", params={"domain": "example.com"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["domain"] == "example.com"
    assert any(r["type"] == "A" for r in body["records"])


@patch(
    "app.services.dns_service.resolve_and_validate_host",
    side_effect=AppError("UNSAFE_TARGET", "This host isn't allowed.", status_code=400),
)
def test_dns_lookup_rejects_unsafe_host(_mock_safety):
    resp = client.get("/api/dns/lookup", params={"domain": "localhost"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "UNSAFE_TARGET"


@patch("app.services.dns_service.resolve_and_validate_host", return_value=["93.184.216.34"])
@patch("app.services.dns_service._resolver")
def test_dns_lookup_caches_repeated_queries(mock_resolver_factory, _mock_safety):
    """A second lookup for the same domain within the TTL window should
    hit the in-process cache rather than calling the resolver again."""
    from app.services import dns_service

    dns_service._lookup_cache.clear()

    mock_resolver = MagicMock()
    mock_resolver_factory.return_value = mock_resolver

    def resolve_side_effect(domain, rtype):
        if rtype == "A":
            answer = [MagicMock(__str__=lambda self: "93.184.216.34")]
            fake = MagicMock()
            fake.__iter__ = lambda self: iter(answer)
            fake.rrset = _fake_rrset()
            return fake
        raise __import__("dns.resolver", fromlist=["NoAnswer"]).NoAnswer()

    mock_resolver.resolve.side_effect = resolve_side_effect

    first = client.get("/api/dns/lookup", params={"domain": "cache-test.example.com"})
    second = client.get("/api/dns/lookup", params={"domain": "cache-test.example.com"})

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()
    # 8 record types queried once on the first call; the second call should
    # add zero additional resolver calls if the cache was used.
    calls_after_first = mock_resolver.resolve.call_count
    client.get("/api/dns/lookup", params={"domain": "cache-test.example.com"})
    assert mock_resolver.resolve.call_count == calls_after_first
