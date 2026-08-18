from pydantic import BaseModel, Field


class UuidGenerateRequest(BaseModel):
    count: int = Field(1, ge=1, le=1000)
    uppercase: bool = False
    hyphens: bool = True


class UuidGenerateResponse(BaseModel):
    success: bool = True
    uuids: list[str]
