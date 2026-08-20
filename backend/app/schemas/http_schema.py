from typing import Literal
from pydantic import BaseModel, Field

HttpMethod = Literal["GET", "POST", "PUT", "PATCH", "DELETE"]


class HttpRequestBody(BaseModel):
    method: HttpMethod = "GET"
    url: str = Field(..., min_length=1)
    headers: dict[str, str] = Field(default_factory=dict)
    query_params: dict[str, str] = Field(default_factory=dict)
    body: str | None = None  # raw JSON text, sent as-is with Content-Type: application/json


class HttpResponseResult(BaseModel):
    success: bool = True
    status_code: int
    status_text: str
    response_time_ms: int
    headers: dict[str, str]
    body: str
    body_is_json: bool
    size_bytes: int
    truncated: bool