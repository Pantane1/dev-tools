from typing import Any
from pydantic import BaseModel, Field


class JwtDecodeRequest(BaseModel):
    token: str = Field(..., min_length=1)


class JwtExpiryInfo(BaseModel):
    status: str  # "VALID" | "EXPIRED" | "NO_EXPIRY"
    detail: str


class JwtDecodeResponse(BaseModel):
    success: bool = True
    header: dict[str, Any]
    payload: dict[str, Any]
    algorithm: str | None = None
    issuer: str | None = None
    subject: str | None = None
    issued_at: str | None = None
    expires_at: str | None = None
    expiry: JwtExpiryInfo
    signature_verified: bool = False
    note: str = "This only decodes the token. The signature has not been cryptographically verified."
