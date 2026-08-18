"""
JSON formatting / validation.

Deliberately avoids eval or exec; uses the standard library json module
only. Input size is capped upstream by MAX_INPUT_BYTES.
"""
import json

from app.core.errors import AppError
from app.schemas.json_schema import JsonValidationError


def format_json(content: str, indent: int, sort_keys: bool) -> tuple[str, str]:
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AppError("INVALID_JSON", _decode_error_message(exc)) from exc

    formatted = json.dumps(parsed, indent=indent, sort_keys=sort_keys, ensure_ascii=False)
    minified = json.dumps(parsed, separators=(",", ":"), sort_keys=sort_keys, ensure_ascii=False)
    return formatted, minified


def validate_json(content: str) -> JsonValidationError | None:
    try:
        json.loads(content)
        return None
    except json.JSONDecodeError as exc:
        return JsonValidationError(
            message=_decode_error_message(exc),
            line=exc.lineno,
            column=exc.colno,
            position=exc.pos,
        )


def _decode_error_message(exc: json.JSONDecodeError) -> str:
    return f"{exc.msg} at line {exc.lineno}, column {exc.colno}"
