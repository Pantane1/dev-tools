from pydantic import BaseModel, Field


class PortCheckRequest(BaseModel):
    host: str = Field(..., min_length=1)
    port: int = Field(..., ge=1, le=65535)


class PortCheckResponse(BaseModel):
    success: bool = True
    host: str
    port: int
    open: bool
    response_time_ms: int | None = None


class PingCheckRequest(BaseModel):
    host: str = Field(..., min_length=1)
    port: int = Field(443, ge=1, le=65535)


class PingAttempt(BaseModel):
    success: bool
    time_ms: int | None = None


class PingCheckResponse(BaseModel):
    success: bool = True
    host: str
    port: int
    attempts: list[PingAttempt]
    packet_loss_percent: int
    min_ms: int | None = None
    avg_ms: int | None = None
    max_ms: int | None = None
    method_note: str = "TCP connect-time latency (ICMP ping isn't available in this environment)."


class WhoisLookupResponse(BaseModel):
    success: bool = True
    domain: str
    registrar: str | None = None
    created: str | None = None
    expires: str | None = None
    status: list[str] = []
    name_servers: list[str] = []
    raw_available: bool = True


class IpLookupResponse(BaseModel):
    success: bool = True
    ip: str
    network_name: str | None = None
    organization: str | None = None
    country: str | None = None
    cidr: str | None = None


class MarkdownPreviewRequest(BaseModel):
    content: str


class MarkdownPreviewResponse(BaseModel):
    success: bool = True
    html: str


class ImageMetadataResponse(BaseModel):
    success: bool = True
    filename: str
    format: str
    width: int
    height: int
    mode: str
    size_bytes: int
    exif: dict[str, str]
    has_gps_data: bool
