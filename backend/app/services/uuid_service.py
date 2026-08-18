import uuid

from app.schemas.uuid_schema import UuidGenerateRequest


def generate_uuids(req: UuidGenerateRequest) -> list[str]:
    results = []
    for _ in range(req.count):
        value = str(uuid.uuid4())
        if not req.hyphens:
            value = value.replace("-", "")
        if req.uppercase:
            value = value.upper()
        results.append(value)
    return results
