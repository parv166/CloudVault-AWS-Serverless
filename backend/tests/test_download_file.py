from __future__ import annotations

import json

from conftest import load_lambda_module
from cloudvault_common.errors import NotFoundError


def test_download_file_returns_presigned_url(monkeypatch):
    app = load_lambda_module("download_file", "download_file_app")
    metadata = {"file_id": "file-1", "s3_key": "uploads/file-1/report.pdf"}

    monkeypatch.setattr(app.storage, "get_metadata", lambda **kwargs: metadata)
    monkeypatch.setattr(
        app.storage,
        "create_download_url",
        lambda **kwargs: "https://signed.example.com/file-1",
    )

    result = app.handler({"pathParameters": {"id": "file-1"}}, None)
    body = json.loads(result["body"])

    assert result["statusCode"] == 200
    assert body["download_url"] == "https://signed.example.com/file-1"
    assert body["expires_in"] == 300
    assert body["file"] == metadata


def test_download_file_returns_404_when_metadata_missing(monkeypatch):
    app = load_lambda_module("download_file", "download_file_not_found_app")
    monkeypatch.setattr(
        app.storage,
        "get_metadata",
        lambda **kwargs: (_ for _ in ()).throw(NotFoundError("File 'missing' was not found")),
    )

    result = app.handler({"pathParameters": {"id": "missing"}}, None)
    body = json.loads(result["body"])

    assert result["statusCode"] == 404
    assert body["error"]["code"] == "not_found"
