from pydantic import BaseModel, Field

SUPPORTED_ALGORITHMS = ["md5", "sha1", "sha256", "sha384", "sha512"]


class HashTextRequest(BaseModel):
    content: str = Field(..., min_length=0)
    algorithms: list[str] = Field(default_factory=lambda: ["sha256"])


class HashResult(BaseModel):
    algorithm: str
    hash: str


class HashTextResponse(BaseModel):
    success: bool = True
    results: list[HashResult]


class HashFileResponse(BaseModel):
    success: bool = True
    filename: str
    size_bytes: int
    results: list[HashResult]
