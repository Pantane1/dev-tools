from pydantic import BaseModel, Field

RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "CAA"]


class DnsRecord(BaseModel):
    type: str
    value: str
    ttl: int | None = None


class DnsLookupResponse(BaseModel):
    success: bool = True
    domain: str
    records: list[DnsRecord]


class DnsCheckItem(BaseModel):
    name: str  # "SPF" | "DMARC" | "DKIM" | "DNSSEC" | "CAA"
    status: str  # "pass" | "warn" | "fail"
    detail: str


class DnsSecurityResponse(BaseModel):
    success: bool = True
    domain: str
    checks: list[DnsCheckItem]
    score: int