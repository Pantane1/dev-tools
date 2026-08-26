"""
IP ownership/network lookup — like whois_service, uses RDAP against the
fixed rdap.org bootstrap host, not an arbitrary user-supplied target, so
no SSRF guard is needed here either. This is distinct from ip_service.py
(the "IP Information" tool), which only classifies an address as
public/private/etc. with no network call at all — this one asks a
registry who *owns* a public IP.
"""
import ipaddress

import httpx

from app.core.errors import AppError

TIMEOUT = 8.0


def lookup(raw_ip: str) -> dict:
    raw_ip = raw_ip.strip()
    try:
        ip = ipaddress.ip_address(raw_ip)
    except ValueError as exc:
        raise AppError("INVALID_IP", f"'{raw_ip}' isn't a valid IP address.") from exc

    if not ip.is_global:
        raise AppError("UNSAFE_TARGET", "Only public IP addresses can be looked up.")

    try:
        response = httpx.get(f"https://rdap.org/ip/{raw_ip}", timeout=TIMEOUT, follow_redirects=True)
    except httpx.HTTPError as exc:
        raise AppError("CONNECTION_FAILED", "Couldn't reach the RDAP registry service.") from exc

    if response.status_code == 404:
        raise AppError("NOT_FOUND", f"No registration data found for '{raw_ip}'.", status_code=404)
    if response.status_code != 200:
        raise AppError("LOOKUP_FAILED", f"Registry lookup failed (HTTP {response.status_code}).")

    data = response.json()

    organization = None
    for entity in data.get("entities", []):
        vcard = entity.get("vcardArray")
        if vcard and len(vcard) > 1:
            for field in vcard[1]:
                if field[0] == "fn":
                    organization = field[3]
                    break
        if organization:
            break

    cidr = None
    start_addr = data.get("startAddress")
    end_addr = data.get("endAddress")
    if start_addr:
        cidr = f"{start_addr} - {end_addr}" if end_addr and end_addr != start_addr else start_addr

    return {
        "ip": raw_ip,
        "network_name": data.get("name"),
        "organization": organization,
        "country": data.get("country"),
        "cidr": cidr,
    }
