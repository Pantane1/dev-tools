from fastapi import APIRouter, Query, Request

from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.ssl_schema import SslCheckResponse
from app.services import ssl_service

router = APIRouter(prefix="/ssl", tags=["ssl"])
settings = get_settings()


@router.get("/check", response_model=SslCheckResponse)
@limiter.limit(settings.rate_limit_network)
async def check_ssl(request: Request, domain: str = Query(..., min_length=1)):
    result = ssl_service.check_ssl(domain)
    return SslCheckResponse(**result)
