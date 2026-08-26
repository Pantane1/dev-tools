from pydantic import BaseModel, Field


class HeadersCheckRequest(BaseModel):
    url: str = Field(..., min_length=1)


class HeaderCheckItem(BaseModel):
    name: str
    present: bool
    value: str | None = None
    why_it_matters: str


class HeadersCheckResponse(BaseModel):
    success: bool = True
    url: str
    status_code: int
    checks: list[HeaderCheckItem]
    score: int
