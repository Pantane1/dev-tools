"""
Hash generation for text and files.

File hashing streams the upload in fixed-size chunks so we never load an
entire large file into memory at once.
"""
import hashlib
from typing import BinaryIO

from app.core.errors import AppError
from app.schemas.hash_schema import SUPPORTED_ALGORITHMS, HashResult

CHUNK_SIZE = 1024 * 1024  # 1MB


def _validate_algorithms(algorithms: list[str]) -> list[str]:
    normalized = [a.lower() for a in algorithms]
    unknown = [a for a in normalized if a not in SUPPORTED_ALGORITHMS]
    if unknown:
        raise AppError(
            "INVALID_INPUT",
            f"Unsupported algorithm(s): {', '.join(unknown)}. Supported: {', '.join(SUPPORTED_ALGORITHMS)}.",
        )
    return normalized


def hash_text(content: str, algorithms: list[str]) -> list[HashResult]:
    normalized = _validate_algorithms(algorithms)
    data = content.encode("utf-8")
    results = []
    for algo in normalized:
        digest = hashlib.new(algo, data).hexdigest()
        results.append(HashResult(algorithm=algo, hash=digest))
    return results


def hash_file(file_obj: BinaryIO, algorithms: list[str]) -> list[HashResult]:
    normalized = _validate_algorithms(algorithms)
    hashers = {algo: hashlib.new(algo) for algo in normalized}

    while True:
        chunk = file_obj.read(CHUNK_SIZE)
        if not chunk:
            break
        for hasher in hashers.values():
            hasher.update(chunk)

    return [HashResult(algorithm=algo, hash=hasher.hexdigest()) for algo, hasher in hashers.items()]
