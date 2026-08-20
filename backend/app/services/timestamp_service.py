from datetime import datetime, timezone

from app.core.errors import AppError


def convert(value: str, direction: str, unit: str) -> dict:
    if direction == "to_date":
        try:
            num = float(value)
        except ValueError as exc:
            raise AppError("INVALID_INPUT", "That doesn't look like a numeric timestamp.") from exc

        seconds = num / 1000 if unit == "milliseconds" else num
        try:
            dt = datetime.fromtimestamp(seconds, tz=timezone.utc)
        except (OSError, OverflowError, ValueError) as exc:
            raise AppError("INVALID_INPUT", "That timestamp is out of range.") from exc

    else:  # to_timestamp
        raw = value.strip()
        parsed = None
        for candidate in (raw, raw.replace(" ", "T")):
            try:
                parsed = datetime.fromisoformat(candidate.replace("Z", "+00:00"))
                break
            except ValueError:
                continue
        if parsed is None:
            raise AppError("INVALID_INPUT", "Couldn't parse that date. Try an ISO 8601 format, e.g. 2026-08-20T14:30:00Z.")
        dt = parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)

    unix_seconds = int(dt.timestamp())
    return {
        "unix_seconds": unix_seconds,
        "unix_milliseconds": unix_seconds * 1000,
        "iso_utc": dt.astimezone(timezone.utc).isoformat(),
        "human_utc": dt.astimezone(timezone.utc).strftime("%A, %B %d, %Y %H:%M:%S UTC"),
    }