"""
Router for the smaller Phase 3 utilities that don't warrant their own
file — none of these make outbound network calls, so they all share the
default (not network/strict) rate limit tier.
"""
import base64

from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.rate_limit import limiter
from app.schemas.misc_schema import (
    Base64Request,
    Base64Response,
    CsvJsonRequest,
    CsvJsonResponse,
    HtmlEntityRequest,
    HtmlEntityResponse,
    IpInfoResponse,
    QrGenerateRequest,
    RegexTestRequest,
    RegexTestResponse,
    TextStatsRequest,
    TextStatsResponse,
    TimestampConvertRequest,
    TimestampConvertResponse,
    UrlEncodeRequest,
    UrlEncodeResponse,
    YamlJsonRequest,
    YamlJsonResponse,
)
from app.services import (
    base64_service,
    csv_json_service,
    html_entity_service,
    ip_service,
    qr_service,
    regex_service,
    text_stats_service,
    timestamp_service,
    url_service,
    yaml_json_service,
)

router = APIRouter(tags=["utilities"])
settings = get_settings()


def _check_size(content: str) -> None:
    if len(content.encode("utf-8")) > settings.max_input_bytes:
        raise AppError("PAYLOAD_TOO_LARGE", "Input is too large to process.", status_code=413)


@router.post("/base64/process", response_model=Base64Response)
@limiter.limit(settings.rate_limit_default)
async def base64_process(request: Request, body: Base64Request):
    _check_size(body.content)
    return Base64Response(result=base64_service.process(body.content, body.mode, body.url_safe))


@router.post("/regex/test", response_model=RegexTestResponse)
@limiter.limit(settings.rate_limit_default)
async def regex_test(request: Request, body: RegexTestRequest):
    _check_size(body.test_text)
    _check_size(body.pattern)
    matches = regex_service.test_regex(body.pattern, body.test_text, body.flags)
    return RegexTestResponse(matches=matches, count=len(matches))


@router.post("/timestamp/convert", response_model=TimestampConvertResponse)
@limiter.limit(settings.rate_limit_default)
async def timestamp_convert(request: Request, body: TimestampConvertRequest):
    _check_size(body.value)
    result = timestamp_service.convert(body.value, body.direction, body.unit)
    return TimestampConvertResponse(**result)


@router.post("/url/process", response_model=UrlEncodeResponse)
@limiter.limit(settings.rate_limit_default)
async def url_process(request: Request, body: UrlEncodeRequest):
    _check_size(body.content)
    return UrlEncodeResponse(result=url_service.process(body.content, body.mode))


@router.post("/html-entities/process", response_model=HtmlEntityResponse)
@limiter.limit(settings.rate_limit_default)
async def html_entity_process(request: Request, body: HtmlEntityRequest):
    _check_size(body.content)
    return HtmlEntityResponse(result=html_entity_service.process(body.content, body.mode))


@router.post("/yaml-json/convert", response_model=YamlJsonResponse)
@limiter.limit(settings.rate_limit_default)
async def yaml_json_convert(request: Request, body: YamlJsonRequest):
    _check_size(body.content)
    return YamlJsonResponse(result=yaml_json_service.process(body.content, body.direction))


@router.post("/csv-json/convert", response_model=CsvJsonResponse)
@limiter.limit(settings.rate_limit_default)
async def csv_json_convert(request: Request, body: CsvJsonRequest):
    _check_size(body.content)
    return CsvJsonResponse(result=csv_json_service.process(body.content, body.direction))


@router.post("/text-stats/analyze", response_model=TextStatsResponse)
@limiter.limit(settings.rate_limit_default)
async def text_stats_analyze(request: Request, body: TextStatsRequest):
    _check_size(body.content)
    result = text_stats_service.analyze(body.content)
    return TextStatsResponse(**result)


@router.post("/qr/generate")
@limiter.limit(settings.rate_limit_default)
async def qr_generate(request: Request, body: QrGenerateRequest):
    _check_size(body.content)
    png_base64 = qr_service.generate(body.content, body.size, body.error_correction)
    return {"success": True, "image_base64": f"data:image/png;base64,{png_base64}"}


@router.get("/ip/info", response_model=IpInfoResponse)
@limiter.limit(settings.rate_limit_default)
async def ip_info(request: Request, ip: str):
    result = ip_service.lookup(ip)
    return IpInfoResponse(**result)
