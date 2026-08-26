"""
The HTTP/API Tester — a simplified Postman. This is the highest-risk tool
in the app (it exists specifically to make outbound requests to
user-supplied URLs), so it gets extra protections on top of the shared
`network_safety` SSRF guard:

  - only GET/POST/PUT/PATCH/DELETE, only http(s) schemes
  - target host resolved and validated before connecting
  - redirects are NOT followed automatically (a 3xx is returned as-is to
    the caller) — this avoids the classic SSRF bypass where a public URL
    redirects to an internal one after the safety check passes
  - request timeout and response-size cap
  - the Host header is never accepted from the caller (it's derived from
    the URL), preventing host-header confusion
"""
import time
from urllib.parse import urlparse

import httpx

from app.core.errors import AppError
from app.core.network_safety import resolve_and_validate_host

TIMEOUT = 10.0
MAX_RESPONSE_BYTES = 2_000_000  # 2MB
FORBIDDEN_REQUEST_HEADERS = {"host", "content-length"}


def _validate_url(raw_url: str) -> str:
    if "://" not in raw_url:
        raw_url = f"https://{raw_url}"

    parsed = urlparse(raw_url)
    if parsed.scheme not in ("http", "https"):
        raise AppError("INVALID_URL", "Only http:// and https:// URLs are supported.")
    if not parsed.hostname:
        raise AppError("INVALID_URL", "Couldn't determine a hostname from that URL.")

    resolve_and_validate_host(parsed.hostname)
    return raw_url


def _execute_request(request_kwargs: dict) -> httpx.Response:
    """Isolated so tests can patch this one function instead of httpx.Client
    globally — patching httpx.Client.request would also intercept
    TestClient's own internal calls to the app under test."""
    with httpx.Client(follow_redirects=False) as client:
        return client.request(**request_kwargs)


def send_request(
    method: str,
    url: str,
    headers: dict[str, str],
    query_params: dict[str, str],
    body: str | None,
) -> dict:
    validated_url = _validate_url(url)

    clean_headers = {k: v for k, v in headers.items() if k.lower() not in FORBIDDEN_REQUEST_HEADERS}

    request_kwargs: dict = {
        "method": method,
        "url": validated_url,
        "headers": clean_headers,
        "params": query_params,
        "timeout": TIMEOUT,
    }
    if body and method in ("POST", "PUT", "PATCH"):
        clean_headers.setdefault("Content-Type", "application/json")
        request_kwargs["content"] = body.encode("utf-8")

    start = time.perf_counter()
    try:
        response = _execute_request(request_kwargs)
    except httpx.TimeoutException as exc:
        raise AppError("CONNECTION_TIMEOUT", f"Request to {url} timed out after {int(TIMEOUT)}s.", status_code=504) from exc
    except httpx.HTTPError as exc:
        raise AppError("CONNECTION_FAILED", f"Could not complete the request to {url}.") from exc

    elapsed_ms = int((time.perf_counter() - start) * 1000)

    raw_body = response.content[:MAX_RESPONSE_BYTES]
    truncated = len(response.content) > MAX_RESPONSE_BYTES
    text_body = raw_body.decode("utf-8", errors="replace")

    body_is_json = "application/json" in response.headers.get("content-type", "")
    if body_is_json:
        try:
            import json

            text_body = json.dumps(json.loads(text_body), indent=2)
        except (ValueError, TypeError):
            body_is_json = False

    return {
        "status_code": response.status_code,
        "status_text": response.reason_phrase or "",
        "response_time_ms": elapsed_ms,
        "headers": dict(response.headers),
        "body": text_body,
        "body_is_json": body_is_json,
        "size_bytes": len(response.content),
        "truncated": truncated,
    }
