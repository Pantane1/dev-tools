from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.core.config import get_settings
from app.core.errors import AppError
from app.schemas.json_schema import (
    JsonFormatRequest,
    JsonFormatResponse,
    JsonValidateRequest,
    JsonValidateResponse,
)
from app.services import json_service

router = APIRouter(prefix="/json", tags=["json"])
settings = get_settings()


def _check_size(content: str) -> None:
    if len(content.encode("utf-8")) > settings.max_input_bytes:
        raise AppError("PAYLOAD_TOO_LARGE", "Input is too large to process.", status_code=413)


@router.post("/format", response_model=JsonFormatResponse)
@limiter.limit(settings.rate_limit_default)
async def format_json(request: Request, body: JsonFormatRequest):
    _check_size(body.content)
    formatted, minified = json_service.format_json(body.content, body.indent, body.sort_keys)
    return JsonFormatResponse(formatted=formatted, minified=minified, size_bytes=len(formatted.encode("utf-8")))


@router.post("/validate", response_model=JsonValidateResponse)
@limiter.limit(settings.rate_limit_default)
async def validate_json(request: Request, body: JsonValidateRequest):
    _check_size(body.content)
    error = json_service.validate_json(body.content)
    return JsonValidateResponse(valid=error is None, error=error)
