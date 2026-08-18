"""
Cryptographically secure password generation.

Uses `secrets` (CSPRNG) rather than `random`. Generated passwords are
never logged or persisted anywhere.
"""
import math
import secrets
import string

from app.schemas.password_schema import PasswordItem, PasswordGenerateRequest

AMBIGUOUS = set("lI1O0o")


def _charset(req: PasswordGenerateRequest) -> str:
    pool = ""
    if req.uppercase:
        pool += string.ascii_uppercase
    if req.lowercase:
        pool += string.ascii_lowercase
    if req.numbers:
        pool += string.digits
    if req.symbols:
        pool += "!@#$%^&*()-_=+[]{};:,.<>?/"

    if req.exclude_ambiguous:
        pool = "".join(ch for ch in pool if ch not in AMBIGUOUS)

    return pool


def _strength_label(entropy_bits: float) -> str:
    if entropy_bits < 28:
        return "weak"
    if entropy_bits < 36:
        return "fair"
    if entropy_bits < 60:
        return "good"
    if entropy_bits < 100:
        return "strong"
    return "excellent"


def generate_passwords(req: PasswordGenerateRequest) -> list[PasswordItem]:
    pool = _charset(req)
    entropy_bits = req.length * math.log2(len(pool))

    passwords = []
    for _ in range(req.count):
        password = "".join(secrets.choice(pool) for _ in range(req.length))
        passwords.append(
            PasswordItem(
                password=password,
                entropy_bits=round(entropy_bits, 1),
                strength=_strength_label(entropy_bits),
            )
        )
    return passwords