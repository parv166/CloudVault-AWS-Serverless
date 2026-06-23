from __future__ import annotations

import base64
import json

from conftest import load_lambda_module


def _event(payload: dict):
    return {"body": json.dumps(payload)}


def test_upload_file_success(monkeypatch):
    app = load_lambda_module("upload_file", "upload_file_success_app")
    uploaded = {}
    saved = {}

    def upload_object(**kwargs):
        uploaded.update(kwargs)

    def save_metadata(**kwargs):
        saved.update(kwargs)

    monkeypatch.setattr(app.storage, "upload_object", upload_object)
    monkeypatch.setattr(app.storage, "save_metadata", save_metadata)

    payload = {
        "file_name": "hello.txt",
        "file_type": "text/plain",
        "content_base64": base64.b64encode(b"hello cloudvault").decode("utf-8"),
    }

    result = app.handler(_event(payload), None)
    body = json.loads(result["body"])

    assert result["statusCode"] == 201
    assert body["file"]["file_name"] == "hello.txt"
    assert body["file"]["file_size"] == len(b"hello cloudvault")
    assert body["file"]["status"] == "uploaded"
    assert uploaded["bucket_name"] == "test-cloudvault-bucket"
    assert uploaded["content"] == b"hello cloudvault"
    assert saved["table_name"] == "test-cloudvault-table"
    assert saved["metadata"]["file_id"] == body["file"]["file_id"]


def test_upload_file_rejects_disallowed_type():
    app = load_lambda_module("upload_file", "upload_file_disallowed_app")
    payload = {
        "file_name": "script.sh",
        "file_type": "application/x-sh",
        "content_base64": base64.b64encode(b"echo nope").decode("utf-8"),
    }

    result = app.handler(_event(payload), None)
    body = json.loads(result["body"])

    assert result["statusCode"] == 400
    assert body["error"]["code"] == "bad_request"


def test_upload_file_rolls_back_s3_when_metadata_save_fails(monkeypatch):
    app = load_lambda_module("upload_file", "upload_file_rollback_app")
    deleted = {}

    monkeypatch.setattr(app.storage, "upload_object", lambda **kwargs: None)
    monkeypatch.setattr(
        app.storage,
        "save_metadata",
        lambda **kwargs: (_ for _ in ()).throw(RuntimeError("dynamodb unavailable")),
    )
    monkeypatch.setattr(app.storage, "delete_object", lambda **kwargs: deleted.update(kwargs))

    payload = {
        "file_name": "hello.txt",
        "file_type": "text/plain",
        "content_base64": base64.b64encode(b"hello").decode("utf-8"),
    }

    result = app.handler(_event(payload), None)

    assert result["statusCode"] == 500
    assert deleted["bucket_name"] == "test-cloudvault-bucket"
    assert deleted["key"].startswith("uploads/")
