from fastapi import APIRouter, Query, Request

from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.dns_schema import DnsLookupResponse, DnsSecurityResponse
from app.services import dns_service

router = APIRouter(prefix="/dns", tags=["dns"])
settings = get_settings()


@router.get("/lookup", response_model=DnsLookupResponse)
@limiter.limit(settings.rate_limit_network)
async def dns_lookup(request: Request, domain: str = Query(..., min_length=1)):
    records = dns_service.lookup_records(domain)
    return DnsLookupResponse(domain=domain.strip().lower(), records=records)


@router.get("/security", response_model=DnsSecurityResponse)
@limiter.limit(settings.rate_limit_network)
async def dns_security(
    request: Request,
    domain: str = Query(..., min_length=1),
    dkim_selector: str | None = Query(None),
):
    checks, score = dns_service.check_security(domain, dkim_selector)
    return DnsSecurityResponse(domain=domain.strip().lower(), checks=checks, score=score)
