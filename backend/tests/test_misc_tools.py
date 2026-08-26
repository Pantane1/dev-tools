from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# --- Base64 ---
def test_base64_encode_decode_roundtrip():
    enc = client.post("/api/base64/process", json={"content": "pantane devtools", "mode": "encode"}).json()
    dec = client.post("/api/base64/process", json={"content": enc["result"], "mode": "decode"}).json()
    assert dec["result"] == "pantane devtools"


def test_base64_invalid_decode_errors_cleanly():
    resp = client.post("/api/base64/process", json={"content": "!!!not base64!!!", "mode": "decode"})
    assert resp.status_code == 400


# --- Regex ---
def test_regex_finds_matches():
    resp = client.post("/api/regex/test", json={"pattern": r"\d+", "test_text": "order 42 and 7", "flags": []})
    body = resp.json()
    assert body["count"] == 2
    assert body["matches"][0]["match"] == "42"


def test_regex_invalid_pattern_errors():
    resp = client.post("/api/regex/test", json={"pattern": "(unclosed", "test_text": "x", "flags": []})
    assert resp.status_code == 400


# --- Timestamp ---
def test_timestamp_to_date():
    resp = client.post("/api/timestamp/convert", json={"value": "1700000000", "direction": "to_date", "unit": "seconds"})
    body = resp.json()
    assert body["unix_seconds"] == 1700000000


def test_timestamp_to_timestamp():
    resp = client.post(
        "/api/timestamp/convert",
        json={"value": "2023-11-14T22:13:20Z", "direction": "to_timestamp", "unit": "seconds"},
    )
    assert resp.json()["unix_seconds"] == 1700000000


# --- URL encode ---
def test_url_encode_decode_roundtrip():
    enc = client.post("/api/url/process", json={"content": "a b/c?d=1", "mode": "encode"}).json()
    dec = client.post("/api/url/process", json={"content": enc["result"], "mode": "decode"}).json()
    assert dec["result"] == "a b/c?d=1"


# --- HTML entities ---
def test_html_entity_encode_decode_roundtrip():
    enc = client.post("/api/html-entities/process", json={"content": "<b>Pantane & Co</b>", "mode": "encode"}).json()
    assert "&lt;b&gt;" in enc["result"]
    dec = client.post("/api/html-entities/process", json={"content": enc["result"], "mode": "decode"}).json()
    assert dec["result"] == "<b>Pantane & Co</b>"


# --- YAML <-> JSON ---
def test_yaml_to_json():
    resp = client.post("/api/yaml-json/convert", json={"content": "name: Pantane\nrole: developer", "direction": "yaml_to_json"})
    body = resp.json()
    assert '"name": "Pantane"' in body["result"]


def test_json_to_yaml():
    resp = client.post("/api/yaml-json/convert", json={"content": '{"name": "Pantane"}', "direction": "json_to_yaml"})
    assert "name: Pantane" in resp.json()["result"]


# --- CSV <-> JSON ---
def test_csv_to_json():
    resp = client.post("/api/csv-json/convert", json={"content": "name,role\nPantane,developer", "direction": "csv_to_json"})
    body = resp.json()
    assert '"name": "Pantane"' in body["result"]


def test_json_to_csv():
    resp = client.post(
        "/api/csv-json/convert",
        json={"content": '[{"name": "Pantane", "role": "developer"}]', "direction": "json_to_csv"},
    )
    result = resp.json()["result"]
    assert "name" in result and "Pantane" in result


# --- Text stats ---
def test_text_stats_counts():
    resp = client.post("/api/text-stats/analyze", json={"content": "Hello world. This is a test!"})
    body = resp.json()
    assert body["words"] == 6
    assert body["sentences"] == 2


# --- QR ---
def test_qr_generate_returns_base64_png():
    resp = client.post("/api/qr/generate", json={"content": "https://pantane.is-a.dev", "size": 200, "error_correction": "M"})
    body = resp.json()
    assert body["image_base64"].startswith("data:image/png;base64,")


# --- IP info ---
def test_ip_info_classifies_private():
    resp = client.get("/api/ip/info", params={"ip": "192.168.1.1"})
    body = resp.json()
    assert body["classification"] == "private"
    assert body["is_public"] is False


def test_ip_info_classifies_public():
    resp = client.get("/api/ip/info", params={"ip": "8.8.8.8"})
    body = resp.json()
    assert body["classification"] == "public"
    assert body["is_public"] is True


def test_ip_info_rejects_invalid():
    resp = client.get("/api/ip/info", params={"ip": "not-an-ip"})
    assert resp.status_code == 400
