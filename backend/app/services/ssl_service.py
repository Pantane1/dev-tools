"""
SSL/TLS certificate inspection.

Performs a normal TLS handshake on port 443 only and reads the
certificate/negotiated protocol — no vulnerability scanning, no
non-standard ports, no arbitrary probing.
"""
import socket
import ssl
from datetime import datetime, timezone

from app.core.errors import AppError
from app.core.network_safety import resolve_and_validate_host

TIMEOUT = 6.0
PORT = 443


def _clean_domain(domain: str) -> str:
    domain = domain.strip().lower()
    for prefix in ("http://", "https://"):
        if domain.startswith(prefix):
            domain = domain[len(prefix):]
    return domain.split("/")[0].split(":")[0].rstrip(".")


def _parse_name(name_tuples) -> str:
    parts = []
    for rdn in name_tuples:
        for key, value in rdn:
            parts.append(f"{key}={value}")
    return ", ".join(parts)


def _parse_cert_date(value: str) -> datetime:
    return datetime.strptime(value, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)


def check_ssl(domain: str) -> dict:
    domain = _clean_domain(domain)
    resolve_and_validate_host(domain)

    context = ssl.create_default_context()

    try:
        with socket.create_connection((domain, PORT), timeout=TIMEOUT) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as tls_sock:
                cert = tls_sock.getpeercert()
                tls_version = tls_sock.version() or "unknown"
    except socket.timeout as exc:
        raise AppError("CONNECTION_TIMEOUT", f"Connection to {domain}:443 timed out.", status_code=504) from exc
    except ssl.SSLCertVerificationError as exc:
        raise AppError("CERT_INVALID", f"Certificate for {domain} failed verification: {exc.verify_message}") from exc
    except (ssl.SSLError, OSError) as exc:
        raise AppError("CONNECTION_FAILED", f"Could not establish a TLS connection to {domain}:443.") from exc

    if not cert:
        raise AppError("CERT_INVALID", f"No certificate returned by {domain}:443.")

    issuer = _parse_name(cert.get("issuer", []))
    subject = _parse_name(cert.get("subject", []))
    san = [value for kind, value in cert.get("subjectAltName", []) if kind == "DNS"]

    not_before = _parse_cert_date(cert["notBefore"])
    not_after = _parse_cert_date(cert["notAfter"])
    now = datetime.now(timezone.utc)
    days_until_expiry = (not_after - now).days

    return {
        "domain": domain,
        "valid": now < not_after,
        "issuer": issuer,
        "subject": subject,
        "san": san,
        "tls_version": tls_version,
        "not_before": not_before.isoformat(),
        "not_after": not_after.isoformat(),
        "days_until_expiry": days_until_expiry,
    }
