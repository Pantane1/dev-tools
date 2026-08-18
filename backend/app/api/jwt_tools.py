from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.core.config import get_settings
from app.schemas.jwt_schema import JwtDecodeRequest, JwtDecodeResponse
from app.services import jwt_service

router = APIRouter(prefix="/jwt", tags=["jwt"])
settings = get_settings()


@router.post("/decode", response_model=JwtDecodeResponse)
@limiter.limit(settings.rate_limit_default)
async def decode_jwt(request: Request, body: JwtDecodeRequest):
    result = jwt_service.decode_jwt(body.token)
    return JwtDecodeResponse(**result)
