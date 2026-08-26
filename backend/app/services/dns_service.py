"""
DNS lookup + a lightweight DNS security posture check (SPF/DMARC/DKIM/
DNSSEC/CAA). This inspects DNS records only — it never claims to perform
cryptographic verification of anything (DKIM signatures, DNSSEC chains).

Results are cached briefly in-process (60s) since DNS records for a
given domain rarely change second-to-second, and this is a cheap way to
absorb repeated lookups of the same domain without hitting a resolver
every time or needing an external cache like Redis.
"""
import time

import dns.resolver

from app.core.errors import AppError
from app.core.network_safety import resolve_and_validate_host
from app.schemas.dns_schema import RECORD_TYPES, DnsCheckItem, DnsRecord

TIMEOUT = 5.0
CACHE_TTL_SECONDS = 60
_lookup_cache: dict[str, tuple[float, list[DnsRecord]]] = {}
_security_cache: dict[str, tuple[float, list[DnsCheckItem], int]] = {}


def _cache_get(cache: dict, key: str):
    entry = cache.get(key)
    if entry and (time.time() - entry[0]) < CACHE_TTL_SECONDS:
        return entry[1:]
    return None


def _resolver() -> dns.resolver.Resolver:
    r = dns.resolver.Resolver()
    r.timeout = TIMEOUT
    r.lifetime = TIMEOUT
    return r


def _clean_domain(domain: str) -> str:
    domain = domain.strip().lower()
    for prefix in ("http://", "https://"):
        if domain.startswith(prefix):
            domain = domain[len(prefix):]
    return domain.split("/")[0].rstrip(".")


def lookup_records(domain: str) -> list[DnsRecord]:
    domain = _clean_domain(domain)

    cached = _cache_get(_lookup_cache, domain)
    if cached:
        return cached[0]

    resolve_and_validate_host(domain)  # confirms the domain resolves to a public host at all

    resolver = _resolver()
    results: list[DnsRecord] = []

    for rtype in RECORD_TYPES:
        try:
            answer = resolver.resolve(domain, rtype)
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers):
            continue
        except dns.exception.Timeout:
            continue

        for rdata in answer:
            results.append(DnsRecord(type=rtype, value=str(rdata).strip('"'), ttl=answer.rrset.ttl if answer.rrset else None))

    if not results:
        raise AppError("NO_RECORDS_FOUND", f"No DNS records found for '{domain}'.")

    _lookup_cache[domain] = (time.time(), results)
    return results


def _query_txt(resolver: dns.resolver.Resolver, name: str) -> list[str]:
    try:
        answer = resolver.resolve(name, "TXT")
        return [str(r).strip('"') for r in answer]
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, dns.exception.Timeout):
        return []


def check_security(domain: str, dkim_selector: str | None) -> tuple[list[DnsCheckItem], int]:
    domain = _clean_domain(domain)

    cache_key = f"{domain}:{dkim_selector or ''}"
    cached = _cache_get(_security_cache, cache_key)
    if cached:
        return cached[0], cached[1]

    resolve_and_validate_host(domain)
    resolver = _resolver()

    checks: list[DnsCheckItem] = []
    score = 0

    # --- SPF ---
    txt_records = _query_txt(resolver, domain)
    spf = next((t for t in txt_records if t.lower().startswith("v=spf1")), None)
    if spf:
        checks.append(DnsCheckItem(name="SPF", status="pass", detail=spf))
        score += 25
    else:
        checks.append(DnsCheckItem(name="SPF", status="fail", detail="No SPF record found."))

    # --- DMARC ---
    dmarc_records = _query_txt(resolver, f"_dmarc.{domain}")
    dmarc = next((t for t in dmarc_records if t.lower().startswith("v=dmarc1")), None)
    if dmarc:
        checks.append(DnsCheckItem(name="DMARC", status="pass", detail=dmarc))
        score += 25
    else:
        checks.append(DnsCheckItem(name="DMARC", status="fail", detail="No DMARC record found at _dmarc." + domain))

    # --- DKIM (needs a selector — most providers don't publish one at a guessable name) ---
    if dkim_selector:
        dkim_records = _query_txt(resolver, f"{dkim_selector}._domainkey.{domain}")
        dkim = next((t for t in dkim_records if "v=dkim1" in t.lower() or "p=" in t.lower()), None)
        if dkim:
            checks.append(DnsCheckItem(name="DKIM", status="pass", detail=f"Selector '{dkim_selector}' found."))
            score += 20
        else:
            checks.append(DnsCheckItem(name="DKIM", status="warn", detail=f"No DKIM record at selector '{dkim_selector}'."))
    else:
        checks.append(DnsCheckItem(name="DKIM", status="warn", detail="No selector provided — DKIM can't be checked without one."))

    # --- DNSSEC (presence of a DNSKEY record is a reasonable "appears configured" signal) ---
    try:
        resolver.resolve(domain, "DNSKEY")
        checks.append(DnsCheckItem(name="DNSSEC", status="pass", detail="DNSKEY record present — DNSSEC appears configured."))
        score += 15
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, dns.exception.Timeout):
        checks.append(DnsCheckItem(name="DNSSEC", status="fail", detail="No DNSKEY record found."))

    # --- CAA ---
    try:
        caa_answer = resolver.resolve(domain, "CAA")
        caa_values = [str(r) for r in caa_answer]
        checks.append(DnsCheckItem(name="CAA", status="pass", detail="; ".join(caa_values)))
        score += 15
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, dns.exception.Timeout):
        checks.append(DnsCheckItem(name="CAA", status="fail", detail="No CAA record found — any CA can issue certificates for this domain."))

    result_score = min(score, 100)
    _security_cache[cache_key] = (time.time(), checks, result_score)
    return checks, result_score
