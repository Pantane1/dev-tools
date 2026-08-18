from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.core.config import get_settings
from app.schemas.uuid_schema import UuidGenerateRequest, UuidGenerateResponse
from app.services import uuid_service

router = APIRouter(prefix="/uuid", tags=["uuid"])
settings = get_settings()


@router.post("/generate", response_model=UuidGenerateResponse)
@limiter.limit(settings.rate_limit_default)
async def generate_uuid(request: Request, body: UuidGenerateRequest):
    uuids = uuid_service.generate_uuids(body)
    return UuidGenerateResponse(uuids=uuids)
