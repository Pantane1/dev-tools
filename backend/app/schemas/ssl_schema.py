from pydantic import BaseModel


class SslCheckResponse(BaseModel):
    success: bool = True
    domain: str
    valid: bool
    issuer: str
    subject: str
    san: list[str]
    tls_version: str
    not_before: str
    not_after: str
    days_until_expiry: int