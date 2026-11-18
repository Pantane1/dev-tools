"""
Markdown Preview and Image Metadata — local processing only, no
outbound network calls, so the default (not network) rate limit tier
applies.
"""
from fastapi import APIRouter, File, Request, UploadFile

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.rate_limit import limiter
from app.schemas.network_extra_schema import (
    ImageMetadataResponse,
    MarkdownPreviewRequest,
    MarkdownPreviewResponse,
)
from app.services import image_metadata_service, markdown_service

router = APIRouter(tags=["content"])
settings = get_settings()


def _check_size(content: str) -> None:
    if len(content.encode("utf-8")) > settings.max_input_bytes:
        raise AppError("PAYLOAD_TOO_LARGE", "Input is too large to process.", status_code=413)


@router.post("/markdown/preview", response_model=MarkdownPreviewResponse)
@limiter.limit(settings.rate_limit_default)
async def markdown_preview(request: Request, body: MarkdownPreviewRequest):
    _check_size(body.content)
    html = markdown_service.render(body.content)
    return MarkdownPreviewResponse(html=html)


@router.post("/image-metadata/extract", response_model=ImageMetadataResponse)
@limiter.limit(settings.rate_limit_default)
async def image_metadata_extract(request: Request, file: UploadFile = File(...)):
    content = await file.read()
    result = image_metadata_service.extract_metadata(file.filename or "upload", content)
    return ImageMetadataResponse(**result)
