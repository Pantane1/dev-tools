"""
Regex testing with a defense against pathological/catastrophic-backtracking
patterns: a hard wall-clock timeout via a worker thread, since Python's `re`
has no native execution timeout. If matching doesn't finish in time we
raise a clean error instead of hanging the request.
"""
import re
import concurrent.futures

from app.core.errors import AppError
from app.schemas.misc_schema import RegexMatch

FLAG_MAP = {"i": re.IGNORECASE, "m": re.MULTILINE, "s": re.DOTALL}
MAX_TEXT_LEN = 100_000
MAX_PATTERN_LEN = 2_000
MATCH_TIMEOUT = 2.0


def _compile(pattern: str, flags: list[str]) -> re.Pattern:
    combined = 0
    for f in flags:
        combined |= FLAG_MAP.get(f, 0)
    try:
        return re.compile(pattern, combined)
    except re.error as exc:
        raise AppError("INVALID_REGEX", f"Invalid pattern: {exc}") from exc


def _find_all(compiled: re.Pattern, text: str) -> list[RegexMatch]:
    return [
        RegexMatch(match=m.group(0), start=m.start(), end=m.end(), groups=list(m.groups()))
        for m in compiled.finditer(text)
    ]


def test_regex(pattern: str, text: str, flags: list[str]) -> list[RegexMatch]:
    if len(pattern) > MAX_PATTERN_LEN:
        raise AppError("INPUT_TOO_LARGE", "Pattern is too long.")
    if len(text) > MAX_TEXT_LEN:
        raise AppError("INPUT_TOO_LARGE", "Test text is too large.")

    compiled = _compile(pattern, flags)

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(_find_all, compiled, text)
        try:
            return future.result(timeout=MATCH_TIMEOUT)
        except concurrent.futures.TimeoutError as exc:
            raise AppError(
                "REGEX_TIMEOUT",
                "This pattern took too long to run against the given text (possible catastrophic backtracking).",
            ) from exc
