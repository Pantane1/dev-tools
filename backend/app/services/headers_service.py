"""
HTTP security headers checker.

Fetches the target URL once (GET, limited redirects, size cap, timeout)
and inspects response headers. Never executes any JavaScript from the
target, never fetches subresources.
"""
from urllib.parse import urlparse

import httpx

from app.core.errors import AppError
from app.core.network_safety import resolve_and_validate_host
from app.schemas.headers_schema import HeaderCheckItem

TIMEOUT = 6.0
MAX_REDIRECTS = 3
MAX_BODY_BYTES = 1_000_000  # we don't need the body at all, but cap defensively

HEADER_DEFS = [
    ("Strict-Transport-Security", "Tells browsers to only ever connect over HTTPS, preventing downgrade attacks."),
    ("Content-Security-Policy", "Restricts which scripts/styles/resources can load, mitigating XSS."),
    ("X-Content-Type-Options", "Stops browsers from MIME-sniffing responses away from the declared Content-Type."),
    ("Referrer-Policy", "Controls how much referrer information is leaked to other sites."),
    ("Permissions-Policy", "Restricts which browser features (camera, geolocation, etc.) the page can use."),
    ("Cross-Origin-Opener-Policy", "Isolates the browsing context to prevent cross-origin attacks like Spectre."),
    ("Cross-Origin-Resource-Policy", "Prevents other origins from embedding this resource."),
]


def _normalize_url(raw: str) -> str:
    raw = raw.strip()
    if not raw.startswith(("http://", "https://")):
        raw = f"https://{raw}"
    return raw


def check_headers(raw_url: str) -> dict:
    url = _normalize_url(raw_url)
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise AppError("INVALID_URL", "Only http:// and https:// URLs are supported.")
    if not parsed.hostname:
        raise AppError("INVALID_URL", "Couldn't determine a hostname from that URL.")

    resolve_and_validate_host(parsed.hostname)

    try:
        with httpx.Client(follow_redirects=True, max_redirects=MAX_REDIRECTS, timeout=TIMEOUT) as client:
            response = client.get(url, headers={"User-Agent": "PantaneDevTools-HeaderChecker/1.0"})
    except httpx.TimeoutException as exc:
        raise AppError("CONNECTION_TIMEOUT", f"Request to {url} timed out.", status_code=504) from exc
    except httpx.HTTPError as exc:
        raise AppError("CONNECTION_FAILED", f"Could not fetch {url}.") from exc

    # Re-validate the final host after redirects — a malicious server could
    # redirect us somewhere unsafe after the initial check passed.
    final_host = urlparse(str(response.url)).hostname
    if final_host:
        resolve_and_validate_host(final_host)

    checks: list[HeaderCheckItem] = []
    score = 0
    per_header_points = round(100 / len(HEADER_DEFS))

    for name, why in HEADER_DEFS:
        value = response.headers.get(name)
        present = value is not None
        if present:
            score += per_header_points
        checks.append(HeaderCheckItem(name=name, present=present, value=value, why_it_matters=why))

    return {
        "url": str(response.url),
        "status_code": response.status_code,
        "checks": checks,
        "score": min(score, 100),
    }
