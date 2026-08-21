"""
Port Checker — checks exactly one host:port pair per request, never a
range. This is a deliberate scope limit: a single-connection reachability
check is a normal diagnostic (the same thing "canyouseeme.org"-style
tools do), whereas iterating a port range is a port scan. The host still
goes through the shared SSRF guard, so this can only ever be pointed at
public targets.
"""
import socket
import time

from app.core.network_safety import resolve_and_validate_host

TIMEOUT = 3.0


def check_port(host: str, port: int) -> dict:
    host = host.strip()
    resolve_and_validate_host(host)

    start = time.perf_counter()
    try:
        with socket.create_connection((host, port), timeout=TIMEOUT):
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            return {"host": host, "port": port, "open": True, "response_time_ms": elapsed_ms}
    except (socket.timeout, ConnectionRefusedError, OSError):
        return {"host": host, "port": port, "open": False, "response_time_ms": None}