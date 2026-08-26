import ipaddress
import socket

from app.core.errors import AppError


def _classify(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> str:
    if ip.is_loopback:
        return "loopback"
    if ip.is_link_local:
        return "link-local"
    if ip.is_multicast:
        return "multicast"
    if ip.is_reserved:
        return "reserved"
    if ip.is_private:
        return "private"
    return "public"


def lookup(raw_ip: str) -> dict:
    raw_ip = raw_ip.strip()
    try:
        ip = ipaddress.ip_address(raw_ip)
    except ValueError as exc:
        raise AppError("INVALID_IP", f"'{raw_ip}' isn't a valid IP address.") from exc

    classification = _classify(ip)
    is_public = classification == "public"

    reverse_dns = None
    if is_public:
        try:
            reverse_dns = socket.getfqdn(raw_ip)
            if reverse_dns == raw_ip:
                reverse_dns = None
        except socket.error:
            reverse_dns = None

    return {
        "ip": raw_ip,
        "version": "IPv6" if ip.version == 6 else "IPv4",
        "classification": classification,
        "is_public": is_public,
        "reverse_dns": reverse_dns,
    }
