import json

import yaml

from app.core.errors import AppError


MAX_INPUT_BYTES = 2_000_000


def process(content: str, direction: str) -> str:
    if len(content.encode("utf-8")) > MAX_INPUT_BYTES:
        from app.core.errors import AppError
        raise AppError("PAYLOAD_TOO_LARGE", "Input is too large to process.", status_code=413)
    if direction == "yaml_to_json":
        try:
            parsed = yaml.safe_load(content)
        except yaml.YAMLError as exc:
            raise AppError("INVALID_YAML", f"Invalid YAML: {exc}") from exc
        return json.dumps(parsed, indent=2, ensure_ascii=False)

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AppError("INVALID_JSON", f"Invalid JSON: {exc.msg} at line {exc.lineno}, column {exc.colno}") from exc
    return yaml.dump(parsed, default_flow_style=False, sort_keys=False, allow_unicode=True)
