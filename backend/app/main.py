"""
Pantane DevTools API — entrypoint.

Run locally with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api import (
    dns_tools,
    hash_tools,
    headers_tools,
    health,
    jwt_tools,
    json_tools,
    password_tools,
    ssl_tools,
    uuid_tools,
)
from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.rate_limit import limiter

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Backend API powering Pantane DevTools — JSON, JWT, hashing, "
    "password/UUID generation, and (from Phase 2) network/security tools.",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# --- Rate limiting ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# --- Structured error handling (no raw tracebacks ever reach the client) ---
register_error_handlers(app)

# --- Routers ---
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(json_tools.router, prefix=settings.api_prefix)
app.include_router(jwt_tools.router, prefix=settings.api_prefix)
app.include_router(hash_tools.router, prefix=settings.api_prefix)
app.include_router(password_tools.router, prefix=settings.api_prefix)
app.include_router(uuid_tools.router, prefix=settings.api_prefix)
app.include_router(dns_tools.router, prefix=settings.api_prefix)
app.include_router(ssl_tools.router, prefix=settings.api_prefix)
app.include_router(headers_tools.router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    return {"success": True, "service": settings.app_name, "docs": "/api/docs"}