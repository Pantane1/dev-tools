from pydantic import BaseModel, Field


class JsonFormatRequest(BaseModel):
    content: str = Field(..., min_length=1, description="Raw JSON text")
    indent: int = Field(2, ge=0, le=8)
    sort_keys: bool = False


class JsonFormatResponse(BaseModel):
    success: bool = True
    formatted: str
    minified: str
    size_bytes: int


class JsonValidateRequest(BaseModel):
    content: str = Field(..., min_length=1)


class JsonValidationError(BaseModel):
    message: str
    line: int
    column: int
    position: int


class JsonValidateResponse(BaseModel):
    success: bool = True
    valid: bool
    error: JsonValidationError | None = None
