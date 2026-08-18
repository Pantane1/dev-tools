from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_format_valid_json():
    resp = client.post("/api/json/format", json={"content": '{"b":1,"a":2}', "indent": 2, "sort_keys": True})
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert '"a": 2' in body["formatted"]
    assert body["minified"] == '{"a":2,"b":1}'


def test_format_invalid_json_returns_clean_error():
    resp = client.post("/api/json/format", json={"content": "{bad json"})
    assert resp.status_code == 400
    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "INVALID_JSON"


def test_validate_json_ok():
    resp = client.post("/api/json/validate", json={"content": "[1,2,3]"})
    assert resp.json()["valid"] is True


def test_validate_json_reports_location():
    resp = client.post("/api/json/validate", json={"content": '{"a":}'})
    body = resp.json()
    assert body["valid"] is False
    assert body["error"]["line"] == 1
