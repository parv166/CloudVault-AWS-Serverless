from __future__ import annotations

from cloudvault_common.http import response


def test_response_reflects_allowed_request_origin(monkeypatch):
    monkeypatch.setenv(
        "CORS_ALLOWED_ORIGINS",
        "https://app.example.com,https://admin.example.com",
    )

    result = response(
        200,
        {"ok": True},
        event={"headers": {"origin": "https://admin.example.com"}},
    )

    assert result["headers"]["Access-Control-Allow-Origin"] == "https://admin.example.com"
    assert result["headers"]["Vary"] == "Origin"


def test_response_uses_wildcard_when_allowed(monkeypatch):
    monkeypatch.setenv("CORS_ALLOWED_ORIGINS", "*")

    result = response(
        200,
        {"ok": True},
        event={"headers": {"origin": "https://app.example.com"}},
    )

    assert result["headers"]["Access-Control-Allow-Origin"] == "*"
    assert "Vary" not in result["headers"]
