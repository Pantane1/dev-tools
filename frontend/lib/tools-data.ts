import type { ToolCategory, ToolMeta } from "@/types/tools";

/**
 * Central tool registry — powers the /tools directory, global search
 * (Ctrl+K), and the homepage "Popular tools" section.
 *
 * Phase 1 ships five fully working tools. The rest are listed as
 * "coming soon" so the directory reflects the full product shape from
 * day one without faking functionality that isn't built yet.
 */
export const TOOLS: ToolMeta[] = [
  // --- Live in Phase 1 ---
  {
    slug: "json",
    name: "JSON Formatter",
    description: "Format, minify, and validate JSON with precise error locations.",
    category: "Developer",
    keywords: ["json", "format", "minify", "validate", "pretty print"],
    status: "live",
  },
  {
    slug: "jwt",
    name: "JWT Decoder",
    description: "Decode a JWT's header and payload, and check its expiry.",
    category: "Security",
    keywords: ["jwt", "token", "decode", "auth", "bearer"],
    status: "live",
  },
  {
    slug: "hash",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-384 or SHA-512 hashes from text or a file.",
    category: "Security",
    keywords: ["hash", "md5", "sha1", "sha256", "sha512", "checksum"],
    status: "live",
  },
  {
    slug: "password",
    name: "Password Generator",
    description: "Generate cryptographically secure passwords with an entropy estimate.",
    category: "Security",
    keywords: ["password", "generator", "secrets", "entropy", "strength"],
    status: "live",
  },
  {
    slug: "uuid",
    name: "UUID Generator",
    description: "Generate one or many UUID v4 identifiers.",
    category: "Developer",
    keywords: ["uuid", "guid", "identifier", "v4"],
    status: "live",
  },

  // --- Coming in later phases ---
  { slug: "base64", name: "Base64 Encoder/Decoder", description: "Encode or decode text using standard or URL-safe Base64.", category: "Developer", keywords: ["base64", "encode", "decode"], status: "coming-soon" },
  { slug: "regex", name: "Regex Tester", description: "Test regular expressions against sample text with match highlighting.", category: "Developer", keywords: ["regex", "regexp", "pattern"], status: "coming-soon" },
  { slug: "timestamp", name: "Timestamp Converter", description: "Convert between Unix timestamps and human-readable dates.", category: "Developer", keywords: ["timestamp", "unix", "epoch", "date"], status: "coming-soon" },
  { slug: "url", name: "URL Encoder/Decoder", description: "Encode or decode URL components.", category: "Developer", keywords: ["url", "encode", "decode", "percent"], status: "coming-soon" },
  { slug: "html-entities", name: "HTML Entity Encoder/Decoder", description: "Encode or decode HTML entities.", category: "Developer", keywords: ["html", "entities", "encode"], status: "coming-soon" },
  { slug: "yaml-json", name: "YAML ↔ JSON Converter", description: "Convert between YAML and JSON.", category: "Developer", keywords: ["yaml", "json", "convert"], status: "coming-soon" },
  { slug: "headers", name: "HTTP Header Analyzer", description: "Inspect a site's security headers and what's missing.", category: "Security", keywords: ["headers", "security", "csp", "hsts"], status: "coming-soon" },
  { slug: "ssl", name: "SSL/TLS Checker", description: "Check a domain's certificate validity, issuer and expiry.", category: "Security", keywords: ["ssl", "tls", "certificate"], status: "coming-soon" },
  { slug: "dns-security", name: "DNS Security Checker", description: "Check SPF, DMARC, DKIM, DNSSEC and CAA records.", category: "Security", keywords: ["dns", "spf", "dmarc", "dkim", "dnssec"], status: "coming-soon" },
  { slug: "ip", name: "IP Information", description: "Look up basic information about an IP address.", category: "Security", keywords: ["ip", "address", "geolocation"], status: "coming-soon" },
  { slug: "dns", name: "DNS Lookup", description: "Look up A, AAAA, MX, NS, TXT, CNAME, SOA and CAA records.", category: "Networking", keywords: ["dns", "lookup", "records"], status: "coming-soon" },
  { slug: "api-tester", name: "HTTP Request Tester", description: "Send GET, POST, PUT, PATCH or DELETE requests and inspect the response.", category: "Networking", keywords: ["http", "api", "request", "postman"], status: "coming-soon" },
  { slug: "ip-lookup", name: "IP Address Lookup", description: "Look up ownership and network info for an IP.", category: "Networking", keywords: ["ip", "whois", "lookup"], status: "coming-soon" },
  { slug: "port-checker", name: "Port Checker", description: "Check whether a port is open on a host.", category: "Networking", keywords: ["port", "checker", "open"], status: "coming-soon" },
  { slug: "ping", name: "Ping / Latency Checker", description: "Check round-trip latency to a host.", category: "Networking", keywords: ["ping", "latency"], status: "coming-soon" },
  { slug: "whois", name: "WHOIS Lookup", description: "Look up domain registration details.", category: "Networking", keywords: ["whois", "domain"], status: "coming-soon" },
  { slug: "csv-json", name: "CSV ↔ JSON Converter", description: "Convert between CSV and JSON.", category: "Data", keywords: ["csv", "json", "convert"], status: "coming-soon" },
  { slug: "text-stats", name: "Text Statistics", description: "Count characters, words, lines and estimate reading time.", category: "Data", keywords: ["text", "words", "characters", "reading time"], status: "coming-soon" },
  { slug: "markdown", name: "Markdown Preview", description: "Preview rendered Markdown side by side with the source.", category: "Data", keywords: ["markdown", "preview"], status: "coming-soon" },
  { slug: "qr", name: "QR Code Generator", description: "Generate QR codes from text, a URL, Wi-Fi credentials, email or phone.", category: "Data", keywords: ["qr", "code", "generator"], status: "coming-soon" },
  { slug: "image-metadata", name: "Image Metadata Viewer", description: "Inspect EXIF and other metadata embedded in an image.", category: "Data", keywords: ["image", "metadata", "exif"], status: "coming-soon" },
];

export const LIVE_TOOLS = TOOLS.filter((t) => t.status === "live");

export const CATEGORIES: ToolCategory[] = ["Developer", "Security", "Networking", "Data"];
