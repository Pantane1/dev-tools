from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.http_schema import HttpRequestBody, HttpResponseResult
from app.services import http_service

router = APIRouter(prefix="/http", tags=["http"])
settings = get_settings()


@router.post("/request", response_model=HttpResponseResult)
@limiter.limit(settings.rate_limit_strict)
async def send_request(request: Request, body: HttpRequestBody):
    result = http_service.send_request(
        method=body.method,
        url=body.url,
        headers=body.headers,
        query_params=body.query_params,
        body=body.body,
    )
    return HttpResponseResult(**result)