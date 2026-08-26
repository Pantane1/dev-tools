"""
Port Checker, Ping (TCP latency), WHOIS, and IP ownership lookup — all
make outbound network calls, so they share the network rate-limit tier.
"""
from fastapi import APIRouter, Query, Request

from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.network_extra_schema import (
    IpLookupResponse,
    PingCheckResponse,
    PortCheckResponse,
    WhoisLookupResponse,
)
from app.services import ip_lookup_service, ping_service, port_service, whois_service

router = APIRouter(tags=["network-extra"])
settings = get_settings()


@router.get("/port/check", response_model=PortCheckResponse)
@limiter.limit(settings.rate_limit_network)
async def port_check(request: Request, host: str = Query(..., min_length=1), port: int = Query(..., ge=1, le=65535)):
    result = port_service.check_port(host, port)
    return PortCheckResponse(**result)


@router.get("/ping/check", response_model=PingCheckResponse)
@limiter.limit(settings.rate_limit_network)
async def ping_check(request: Request, host: str = Query(..., min_length=1), port: int = Query(443, ge=1, le=65535)):
    result = ping_service.ping(host, port)
    return PingCheckResponse(**result)


@router.get("/whois/lookup", response_model=WhoisLookupResponse)
@limiter.limit(settings.rate_limit_network)
async def whois_lookup(request: Request, domain: str = Query(..., min_length=1)):
    result = whois_service.lookup(domain)
    return WhoisLookupResponse(**result)


@router.get("/ip-lookup/lookup", response_model=IpLookupResponse)
@limiter.limit(settings.rate_limit_network)
async def ip_lookup(request: Request, ip: str = Query(..., min_length=1)):
    result = ip_lookup_service.lookup(ip)
    return IpLookupResponse(**result)
