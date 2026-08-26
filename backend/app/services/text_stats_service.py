import re

WORDS_PER_MINUTE = 200


def analyze(content: str) -> dict:
    characters = len(content)
    characters_no_spaces = len(re.sub(r"\s", "", content))
    words = len(content.split())
    lines = content.count("\n") + (1 if content else 0)
    sentences = len(re.findall(r"[.!?]+(?:\s|$)", content)) or (1 if content.strip() else 0)
    reading_time_seconds = max(1, round((words / WORDS_PER_MINUTE) * 60)) if words else 0

    return {
        "characters": characters,
        "characters_no_spaces": characters_no_spaces,
        "words": words,
        "lines": lines,
        "sentences": sentences,
        "reading_time_seconds": reading_time_seconds,
    }
