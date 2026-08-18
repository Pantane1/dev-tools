from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.headers_schema import HeadersCheckRequest, HeadersCheckResponse
from app.services import headers_service

router = APIRouter(prefix="/headers", tags=["headers"])
settings = get_settings()


@router.post("/check", response_model=HeadersCheckResponse)
@limiter.limit(settings.rate_limit_network)
async def check_headers(request: Request, body: HeadersCheckRequest):
    result = headers_service.check_headers(body.url)
    return HeadersCheckResponse(**result)