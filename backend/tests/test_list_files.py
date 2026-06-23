from __future__ import annotations

import json

from conftest import load_lambda_module


def test_list_files_returns_files_sorted_by_upload_time(monkeypatch):
    app = load_lambda_module("list_files", "list_files_app")
    monkeypatch.setattr(
        app.storage,
        "list_metadata",
        lambda **kwargs: [
            {"file_id": "older", "upload_time": "2026-06-20T10:00:00Z"},
            {"file_id": "newer", "upload_time": "2026-06-21T10:00:00Z"},
        ],
    )

    result = app.handler({}, None)
    body = json.loads(result["body"])

    assert result["statusCode"] == 200
    assert body["count"] == 2
    assert [item["file_id"] for item in body["files"]] == ["newer", "older"]
