"""
Shared SSRF / private-network protection for every tool that makes an
outbound network call on the user's behalf (DNS, SSL, HTTP headers, and
Phase 3's API tester).

The rule is simple: a hostname the user supplies must resolve only to
public, routable IP addresses. Anything that resolves to loopback,
private, link-local, multicast, reserved, or the common cloud metadata
address is rejected before we ever open a connection.
"""
import ipaddress
import socket

from app.core.errors import AppError

# 169.254.169.254 is the AWS/GCP/Azure instance-metadata endpoint — the
# classic SSRF target. It technically falls under link-local (169.254.0.0/16)
# and would already be caught below, but it's called out explicitly so the
# error message names the actual risk instead of just "link-local".
METADATA_IPS = {"169.254.169.254", "fd00:ec2::254"}

BLOCKED_HOSTNAMES = {"localhost", "localhost.localdomain", "metadata.google.internal"}

MAX_RESOLVED_IPS = 8


def _is_unsafe_ip(ip_str: str) -> bool:
    if ip_str in METADATA_IPS:
        return True
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return True  # can't parse it -> treat as unsafe

    return (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    )


def resolve_and_validate_host(hostname: str) -> list[str]:
    """
    Resolve `hostname` and raise AppError if it's not safe to connect to.
    Returns the list of resolved IPs on success (useful for logging/tests).
    """
    hostname = hostname.strip().lower().rstrip(".")

    if not hostname or hostname in BLOCKED_HOSTNAMES:
        raise AppError("UNSAFE_TARGET", "This host isn't allowed.", status_code=400)

    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise AppError("DNS_RESOLUTION_FAILED", f"Could not resolve '{hostname}'.", status_code=400) from exc

    ips = list({info[4][0] for info in addr_info})[:MAX_RESOLVED_IPS]
    if not ips:
        raise AppError("DNS_RESOLUTION_FAILED", f"Could not resolve '{hostname}'.", status_code=400)

    for ip in ips:
        if _is_unsafe_ip(ip):
            raise AppError(
                "UNSAFE_TARGET",
                "This host resolves to a private, local, or reserved address and can't be checked.",
                status_code=400,
            )

    return ips
