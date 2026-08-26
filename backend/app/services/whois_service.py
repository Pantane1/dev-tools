"""
WHOIS Lookup — implemented via RDAP (Registration Data Access Protocol),
the modern, structured, HTTP-based successor to the WHOIS text protocol
that IANA and most registries now support. We query the public rdap.org
bootstrap service, which redirects to the authoritative registry — the
request target is always rdap.org itself (a fixed, trusted host), never
a user-controlled host, so this doesn't need the SSRF guard the way
DNS/SSL/Headers do. The user-supplied domain only ever appears as a
path segment in the query.
"""
import re

import httpx

from app.core.errors import AppError

TIMEOUT = 8.0
DOMAIN_RE = re.compile(r"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$")


def _clean_domain(domain: str) -> str:
    domain = domain.strip().lower()
    for prefix in ("http://", "https://"):
        if domain.startswith(prefix):
            domain = domain[len(prefix):]
    domain = domain.split("/")[0].rstrip(".")
    if not DOMAIN_RE.match(domain):
        raise AppError("INVALID_DOMAIN", f"'{domain}' doesn't look like a valid domain.")
    return domain


def _extract_events(events: list[dict], action: str) -> str | None:
    for event in events or []:
        if event.get("eventAction") == action:
            return event.get("eventDate")
    return None


def lookup(domain: str) -> dict:
    domain = _clean_domain(domain)

    try:
        response = httpx.get(f"https://rdap.org/domain/{domain}", timeout=TIMEOUT, follow_redirects=True)
    except httpx.HTTPError as exc:
        raise AppError("CONNECTION_FAILED", "Couldn't reach the RDAP registry service.") from exc

    if response.status_code == 404:
        raise AppError("NOT_FOUND", f"No registration data found for '{domain}'.", status_code=404)
    if response.status_code != 200:
        raise AppError("LOOKUP_FAILED", f"Registry lookup failed (HTTP {response.status_code}).")

    data = response.json()

    registrar = None
    for entity in data.get("entities", []):
        if "registrar" in entity.get("roles", []):
            vcard = entity.get("vcardArray")
            if vcard and len(vcard) > 1:
                for field in vcard[1]:
                    if field[0] == "fn":
                        registrar = field[3]
                        break
            registrar = registrar or entity.get("handle")
            break

    return {
        "domain": domain,
        "registrar": registrar,
        "created": _extract_events(data.get("events", []), "registration"),
        "expires": _extract_events(data.get("events", []), "expiration"),
        "status": data.get("status", []),
        "name_servers": [ns.get("ldhName") for ns in data.get("nameservers", []) if ns.get("ldhName")],
    }
