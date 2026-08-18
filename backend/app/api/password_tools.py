from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.core.config import get_settings
from app.schemas.password_schema import PasswordGenerateRequest, PasswordGenerateResponse
from app.services import password_service

router = APIRouter(prefix="/password", tags=["password"])
settings = get_settings()


@router.post("/generate", response_model=PasswordGenerateResponse)
@limiter.limit(settings.rate_limit_default)
async def generate_password(request: Request, body: PasswordGenerateRequest):
    passwords = password_service.generate_passwords(body)
    return PasswordGenerateResponse(passwords=passwords)
