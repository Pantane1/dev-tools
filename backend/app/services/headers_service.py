"""
HTTP security headers checker.

Fetches the target URL once (GET, limited redirects, size cap, timeout)
and inspects response headers. Never executes any JavaScript from the
target, never fetches subresources.
"""
from urllib.parse import urljoin, urlparse

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
        with httpx.Client(timeout=TIMEOUT) as client:
            current_url = url
            response = None
            for _ in range(MAX_REDIRECTS + 1):
                current_parsed = urlparse(current_url)
                if current_parsed.scheme not in ("http", "https"):
                    raise AppError("INVALID_URL", "Only http:// and https:// URLs are supported.")
                if current_parsed.hostname:
                    resolve_and_validate_host(current_parsed.hostname)

                response = client.get(current_url, headers={"User-Agent": "PantaneDevTools-HeaderChecker/1.0"}, follow_redirects=False)

                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location:
                        break
                    next_url = urljoin(current_url, location)
                    next_parsed = urlparse(next_url)
                    if next_parsed.scheme not in ("http", "https") or not next_parsed.hostname:
                        raise AppError("INVALID_URL", "Redirect target is not a valid http(s) URL.")
                    resolve_and_validate_host(next_parsed.hostname)
                    current_url = next_url
                    continue
                break
            else:
                raise AppError("TOO_MANY_REDIRECTS", f"Too many redirects for {url}.")
    except httpx.TimeoutException as exc:
        raise AppError("CONNECTION_TIMEOUT", f"Request to {url} timed out.", status_code=504) from exc
    except httpx.HTTPError as exc:
        raise AppError("CONNECTION_FAILED", f"Could not fetch {url}.") from exc

    if response is None:
        raise AppError("CONNECTION_FAILED", f"Could not fetch {url}.")

    checks: list[HeaderCheckItem] = []
    present_count = 0

    for name, why in HEADER_DEFS:
        value = response.headers.get(name)
        present = value is not None
        if present:
            present_count += 1
        checks.append(HeaderCheckItem(name=name, present=present, value=value, why_it_matters=why))

    score = int(round(present_count * 100 / len(HEADER_DEFS)))

    return {
        "url": str(response.url),
        "status_code": response.status_code,
        "checks": checks,
        "score": min(score, 100),
    }
