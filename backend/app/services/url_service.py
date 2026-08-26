from urllib.parse import quote, unquote

from app.core.errors import AppError


def process(content: str, mode: str) -> str:
    if mode == "encode":
        return quote(content, safe="")
    try:
        return unquote(content, errors="strict")
    except Exception as exc:  # noqa: BLE001
        raise AppError("INVALID_INPUT", "Couldn't decode that as a URL-encoded string.") from exc
