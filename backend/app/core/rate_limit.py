"""
Rate limiting setup using slowapi (in-memory by default, Redis when
REDIS_URL is configured — needed for multi-instance deployments).

Tool routes apply one of three named limits depending on how expensive /
abusable they are:

    default -> local/CPU-only tools (JSON, hash, UUID, password, base64...)
    network -> tools that make outbound requests (DNS, SSL, headers)
    strict  -> the HTTP/API tester (highest SSRF and abuse risk)
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings

settings = get_settings()

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.redis_url or "memory://",
    default_limits=[settings.rate_limit_default],
)
