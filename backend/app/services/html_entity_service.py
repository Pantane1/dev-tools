import html


def process(content: str, mode: str) -> str:
    if mode == "encode":
        return html.escape(content, quote=True)
    return html.unescape(content)