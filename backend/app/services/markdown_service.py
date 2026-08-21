"""
Markdown -> HTML preview.

The rendered HTML is sanitized with bleach before being returned — raw
Markdown can embed raw HTML (including <script>), and this output gets
rendered directly in the browser, so it must be safe by the time it
leaves the backend rather than relying on the frontend to sanitize it.
"""
import bleach
import markdown as md

ALLOWED_TAGS = [
    "p", "br", "hr",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "em", "del", "code", "pre",
    "ul", "ol", "li",
    "blockquote",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
]
ALLOWED_ATTRS = {
    "a": ["href", "title"],
    "img": ["src", "alt", "title"],
}
ALLOWED_PROTOCOLS = ["http", "https", "mailto"]

MAX_INPUT_LEN = 200_000


def render(content: str) -> str:
    content = content[:MAX_INPUT_LEN]
    raw_html = md.markdown(content, extensions=["fenced_code", "tables", "nl2br"])
    return bleach.clean(
        raw_html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRS,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
    )