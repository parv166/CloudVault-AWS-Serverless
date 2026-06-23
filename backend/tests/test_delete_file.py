from __future__ import annotations

import json

from conftest import load_lambda_module


def test_delete_file_removes_object_and_metadata(monkeypatch):
    app = load_lambda_module("delete_file", "delete_file_app")
    deleted_object = {}
    deleted_metadata = {}
    metadata = {"file_id": "file-1", "s3_key": "uploads/file-1/report.pdf"}

    monkeypatch.setattr(app.storage, "get_metadata", lambda **kwargs: metadata)
    monkeypatch.setattr(app.storage, "delete_object", lambda **kwargs: deleted_object.update(kwargs))
    monkeypatch.setattr(
        app.storage,
        "delete_metadata",
        lambda **kwargs: deleted_metadata.update(kwargs),
    )

    result = app.handler({"pathParameters": {"id": "file-1"}}, None)
    body = json.loads(result["body"])

    assert result["statusCode"] == 200
    assert body["file_id"] == "file-1"
    assert deleted_object == {
        "bucket_name": "test-cloudvault-bucket",
        "key": "uploads/file-1/report.pdf",
    }
    assert deleted_metadata == {"table_name": "test-cloudvault-table", "file_id": "file-1"}
