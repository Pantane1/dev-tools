import base64
import io

import qrcode
from qrcode.constants import ERROR_CORRECT_H, ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q

from app.core.errors import AppError

ERROR_LEVELS = {"L": ERROR_CORRECT_L, "M": ERROR_CORRECT_M, "Q": ERROR_CORRECT_Q, "H": ERROR_CORRECT_H}
MAX_CONTENT_LEN = 2000


def generate(content: str, size: int, error_correction: str) -> str:
    if len(content) > MAX_CONTENT_LEN:
        raise AppError("INPUT_TOO_LARGE", "Content is too long to encode as a QR code.")

    qr = qrcode.QRCode(error_correction=ERROR_LEVELS[error_correction], border=2)
    qr.add_data(content)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    img = img.resize((size, size))

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")
