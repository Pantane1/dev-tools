"""
Centralized, structured error handling.

Every error returned to the client follows the same shape:

    {
      "success": false,
      "error": { "code": "INVALID_INPUT", "message": "..." }
    }

Raw exceptions / tracebacks are never sent to the client. Details are
logged server-side only.
"""
import logging
import uuid

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("pantane_devtools")


class AppError(Exception):
    """Base application error with a stable machine-readable code."""

    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _error_body(code: str, message: str) -> dict:
    return {"success": False, "error": {"code": code, "message": message}}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content=_error_body(exc.code, exc.message))

    @app.exception_handler(HTTPException)
    async def handle_http_exception(_: Request, exc: HTTPException):
        detail = exc.detail if isinstance(exc.detail, str) else "Request failed."
        return JSONResponse(status_code=exc.status_code, content=_error_body("HTTP_ERROR", detail))

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception):
        incident_id = str(uuid.uuid4())
        logger.exception("Unhandled error [%s] on %s", incident_id, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body(
                "INTERNAL_ERROR",
                "Something went wrong. Please check your input and try again.",
            ),
        )
