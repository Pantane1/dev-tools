"""
JWT decoding (NOT verification).

We intentionally decode header + payload without checking the signature,
since we have no way of knowing the signing secret/key for an arbitrary
token a user pastes in. The API and the UI must both make this explicit,
per the product spec, so nobody mistakes "decoded" for "verified".

JWTs are never logged.
"""
import base64
import json
from datetime import datetime, timezone

from app.core.errors import AppError
from app.schemas.jwt_schema import JwtExpiryInfo


def _b64url_decode(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(segment + padding)


def decode_jwt(token: str) -> dict:
    parts = token.strip().split(".")
    if len(parts) not in (2, 3):
        raise AppError("INVALID_JWT", "That doesn't look like a JWT (expected header.payload.signature).")

    try:
        header = json.loads(_b64url_decode(parts[0]))
        payload = json.loads(_b64url_decode(parts[1]))
    except Exception as exc:  # noqa: BLE001 - surface as a clean validation error
        raise AppError("INVALID_JWT", "Could not decode this token. Check that it's valid Base64URL JSON.") from exc

    now = datetime.now(timezone.utc)
    exp = payload.get("exp")
    iat = payload.get("iat")

    expires_at = _to_iso(exp)
    issued_at = _to_iso(iat)

    if exp is None:
        expiry = JwtExpiryInfo(status="NO_EXPIRY", detail="This token has no expiration claim.")
    else:
        exp_dt = datetime.fromtimestamp(exp, tz=timezone.utc)
        if exp_dt >= now:
            expiry = JwtExpiryInfo(status="VALID", detail=f"Expires {_relative(exp_dt, now)}")
        else:
            expiry = JwtExpiryInfo(status="EXPIRED", detail=f"Expired {_relative(exp_dt, now)}")

    return {
        "header": header,
        "payload": payload,
        "algorithm": header.get("alg"),
        "issuer": payload.get("iss"),
        "subject": payload.get("sub"),
        "issued_at": issued_at,
        "expires_at": expires_at,
        "expiry": expiry,
        "signature_verified": False,
    }


def _to_iso(ts) -> str | None:
    if ts is None:
        return None
    try:
        return datetime.fromtimestamp(float(ts), tz=timezone.utc).isoformat()
    except (TypeError, ValueError, OSError):
        return None


def _relative(target: datetime, now: datetime) -> str:
    delta = target - now
    seconds = int(delta.total_seconds())
    future = seconds >= 0
    seconds = abs(seconds)

    if seconds < 60:
        value, unit = seconds, "second"
    elif seconds < 3600:
        value, unit = seconds // 60, "minute"
    elif seconds < 86400:
        value, unit = seconds // 3600, "hour"
    else:
        value, unit = seconds // 86400, "day"

    unit_str = f"{unit}{'s' if value != 1 else ''}"
    return f"in {value} {unit_str}" if future else f"{value} {unit_str} ago"
