from fastapi import APIRouter, File, Form, Request, UploadFile

from app.core.rate_limit import limiter
from app.core.config import get_settings
from app.core.errors import AppError
from app.schemas.hash_schema import HashFileResponse, HashTextRequest, HashTextResponse
from app.services import hash_service

router = APIRouter(prefix="/hash", tags=["hash"])
settings = get_settings()

MAX_FILE_BYTES = 200 * 1024 * 1024  # 200MB


@router.post("/text", response_model=HashTextResponse)
@limiter.limit(settings.rate_limit_default)
async def hash_text(request: Request, body: HashTextRequest):
    results = hash_service.hash_text(body.content, body.algorithms)
    return HashTextResponse(results=results)


@router.post("/file", response_model=HashFileResponse)
@limiter.limit(settings.rate_limit_default)
async def hash_file(
    request: Request,
    file: UploadFile = File(...),
    algorithms: str = Form("sha256"),
):
    algo_list = [a.strip() for a in algorithms.split(",") if a.strip()]

    size = 0
    chunks = []
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        size += len(chunk)
        if size > MAX_FILE_BYTES:
            raise AppError("PAYLOAD_TOO_LARGE", "File is too large to hash (max 200MB).", status_code=413)
        chunks.append(chunk)

    import io

    buffer = io.BytesIO(b"".join(chunks))
    results = hash_service.hash_file(buffer, algo_list)
    return HashFileResponse(filename=file.filename or "upload", size_bytes=size, results=results)
