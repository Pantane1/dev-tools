"""
"Ping" via TCP connect-time, not ICMP. Cloud hosts (including Render)
typically don't grant raw-socket / CAP_NET_RAW permissions needed for
real ICMP echo, and browsers can't send ICMP at all — so, like most
web-based "ping" tools, this measures TCP handshake latency to a port
instead. The response is explicit about this (see method_note in the
schema) so it's never mistaken for a true ICMP RTT.
"""
import socket
import time

from app.core.network_safety import resolve_and_validate_host

TIMEOUT = 3.0
ATTEMPTS = 4


def ping(host: str, port: int) -> dict:
    host = host.strip()
    resolve_and_validate_host(host)

    attempts = []
    for _ in range(ATTEMPTS):
        start = time.perf_counter()
        try:
            with socket.create_connection((host, port), timeout=TIMEOUT):
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                attempts.append({"success": True, "time_ms": elapsed_ms})
        except (socket.timeout, ConnectionRefusedError, OSError):
            attempts.append({"success": False, "time_ms": None})

    successful = [a["time_ms"] for a in attempts if a["success"]]
    packet_loss = round((1 - len(successful) / ATTEMPTS) * 100)

    return {
        "host": host,
        "port": port,
        "attempts": attempts,
        "packet_loss_percent": packet_loss,
        "min_ms": min(successful) if successful else None,
        "avg_ms": round(sum(successful) / len(successful)) if successful else None,
        "max_ms": max(successful) if successful else None,
    }
