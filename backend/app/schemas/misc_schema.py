"""Shared request/response schemas for the smaller Phase 3 utilities."""
from pydantic import BaseModel, Field


# --- Base64 ---
class Base64Request(BaseModel):
    content: str
    mode: str = Field("encode", pattern="^(encode|decode)$")
    url_safe: bool = False


class Base64Response(BaseModel):
    success: bool = True
    result: str


# --- Regex ---
class RegexTestRequest(BaseModel):
    pattern: str
    test_text: str
    flags: list[str] = Field(default_factory=list)  # "i", "m", "s"


class RegexMatch(BaseModel):
    match: str
    start: int
    end: int
    groups: list[str | None]


class RegexTestResponse(BaseModel):
    success: bool = True
    matches: list[RegexMatch]
    count: int


# --- Timestamp ---
class TimestampConvertRequest(BaseModel):
    value: str  # either a unix timestamp or an ISO-ish date string
    direction: str = Field(..., pattern="^(to_date|to_timestamp)$")
    unit: str = Field("seconds", pattern="^(seconds|milliseconds)$")


class TimestampConvertResponse(BaseModel):
    success: bool = True
    unix_seconds: int
    unix_milliseconds: int
    iso_utc: str
    human_utc: str


# --- URL encode ---
class UrlEncodeRequest(BaseModel):
    content: str
    mode: str = Field("encode", pattern="^(encode|decode)$")


class UrlEncodeResponse(BaseModel):
    success: bool = True
    result: str


# --- HTML entities ---
class HtmlEntityRequest(BaseModel):
    content: str
    mode: str = Field("encode", pattern="^(encode|decode)$")


class HtmlEntityResponse(BaseModel):
    success: bool = True
    result: str


# --- YAML <-> JSON ---
class YamlJsonRequest(BaseModel):
    content: str
    direction: str = Field(..., pattern="^(yaml_to_json|json_to_yaml)$")


class YamlJsonResponse(BaseModel):
    success: bool = True
    result: str


# --- CSV <-> JSON ---
class CsvJsonRequest(BaseModel):
    content: str
    direction: str = Field(..., pattern="^(csv_to_json|json_to_csv)$")


class CsvJsonResponse(BaseModel):
    success: bool = True
    result: str


# --- Text statistics ---
class TextStatsRequest(BaseModel):
    content: str


class TextStatsResponse(BaseModel):
    success: bool = True
    characters: int
    characters_no_spaces: int
    words: int
    lines: int
    sentences: int
    reading_time_seconds: int


# --- QR code ---
class QrGenerateRequest(BaseModel):
    content: str = Field(..., min_length=1)
    size: int = Field(300, ge=100, le=1000)
    error_correction: str = Field("M", pattern="^(L|M|Q|H)$")


# --- IP info ---
class IpInfoRequest(BaseModel):
    ip: str


class IpInfoResponse(BaseModel):
    success: bool = True
    ip: str
    version: str  # "IPv4" | "IPv6"
    classification: str  # "public" | "private" | "loopback" | "link-local" | "reserved" | "multicast"
    is_public: bool
    reverse_dns: str | None = None