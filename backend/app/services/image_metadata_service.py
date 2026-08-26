"""
Image metadata / EXIF viewer. Pure local file parsing — no network call,
so no SSRF surface here. Guards against decompression-bomb-style abuse
via Pillow's built-in MAX_IMAGE_PIXELS check plus an explicit byte cap
on the upload before we ever call Image.open().
"""
import io

from PIL import ExifTags, Image

from app.core.errors import AppError

MAX_FILE_BYTES = 25 * 1024 * 1024  # 25MB

GPS_TAG_ID = next((k for k, v in ExifTags.TAGS.items() if v == "GPSInfo"), None)


def extract_metadata(filename: str, content: bytes) -> dict:
    if len(content) > MAX_FILE_BYTES:
        raise AppError("PAYLOAD_TOO_LARGE", "Image is too large (max 25MB).", status_code=413)

    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
        img = Image.open(io.BytesIO(content))  # re-open — verify() consumes the parser
    except Exception as exc:  # noqa: BLE001
        raise AppError("INVALID_IMAGE", "Couldn't read that as an image file.") from exc

    exif_raw = img.getexif()
    exif: dict[str, str] = {}
    has_gps = False

    for tag_id, value in exif_raw.items():
        tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
        if tag_id == GPS_TAG_ID:
            has_gps = bool(value)
            continue
        try:
            exif[tag_name] = str(value)
        except Exception:  # noqa: BLE001
            continue

    return {
        "filename": filename,
        "format": img.format or "unknown",
        "width": img.width,
        "height": img.height,
        "mode": img.mode,
        "size_bytes": len(content),
        "exif": exif,
        "has_gps_data": has_gps,
    }
