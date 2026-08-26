import base64

from app.core.errors import AppError


def process(content: str, mode: str, url_safe: bool) -> str:
    encoder = base64.urlsafe_b64encode if url_safe else base64.b64encode
    decoder = base64.urlsafe_b64decode if url_safe else base64.b64decode

    if mode == "encode":
        return encoder(content.encode("utf-8")).decode("ascii")

    try:
        padded = content + "=" * (-len(content) % 4)
        return decoder(padded).decode("utf-8")
    except Exception as exc:  # noqa: BLE001
        raise AppError("INVALID_BASE64", "That doesn't look like valid Base64.") from exc
