import csv
import io
import json

from app.core.errors import AppError


def process(content: str, direction: str) -> str:
    if direction == "csv_to_json":
        try:
            reader = csv.DictReader(io.StringIO(content))
            rows = list(reader)
        except csv.Error as exc:
            raise AppError("INVALID_CSV", f"Invalid CSV: {exc}") from exc
        if reader.fieldnames is None:
            raise AppError("INVALID_CSV", "Couldn't find a header row in that CSV.")
        return json.dumps(rows, indent=2, ensure_ascii=False)

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AppError("INVALID_JSON", f"Invalid JSON: {exc.msg} at line {exc.lineno}, column {exc.colno}") from exc

    if not isinstance(parsed, list) or not all(isinstance(row, dict) for row in parsed):
        raise AppError("INVALID_INPUT", "JSON must be an array of flat objects to convert to CSV.")
    if not parsed:
        return ""

    fieldnames = list({key for row in parsed for key in row.keys()})
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(parsed)
    return output.getvalue()
