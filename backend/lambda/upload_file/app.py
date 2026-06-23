from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from cloudvault_common import storage
from cloudvault_common.config import load_config
from cloudvault_common.errors import CloudVaultError
from cloudvault_common.http import error_response, parse_json_body, response
from cloudvault_common.validation import parse_upload_payload

logger = logging.getLogger(__name__)


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    try:
        config = load_config()
        logger.setLevel(config.log_level)

        payload = parse_json_body(event)
        upload = parse_upload_payload(
            payload,
            config.allowed_file_types,
            config.max_file_size_bytes,
        )

        file_id = str(uuid4())
        s3_key = f"uploads/{file_id}/{upload.file_name}"
        metadata = {
            "file_id": file_id,
            "file_name": upload.file_name,
            "file_size": upload.file_size,
            "file_type": upload.file_type,
            "upload_time": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "s3_key": s3_key,
            "status": "uploaded",
        }

        uploaded_to_s3 = False
        try:
            storage.upload_object(
                bucket_name=config.bucket_name,
                key=s3_key,
                content=upload.content,
                content_type=upload.file_type,
                file_id=file_id,
                sse_algorithm=config.s3_sse_algorithm,
            )
            uploaded_to_s3 = True

            storage.save_metadata(table_name=config.table_name, metadata=metadata)
        except Exception:
            if uploaded_to_s3:
                try:
                    storage.delete_object(bucket_name=config.bucket_name, key=s3_key)
                except Exception:
                    logger.exception("Failed to roll back S3 object after metadata write failure")
            raise

        logger.info("File uploaded", extra={"file_id": file_id, "s3_key": s3_key})
        return response(201, {"file": metadata}, event=event)

    except CloudVaultError as exc:
        logger.warning("Request failed: %s", exc)
        return error_response(exc.status_code, str(exc), exc.error_code, event=event)
    except Exception:
        logger.exception("Unhandled upload_file error")
        return error_response(500, "Internal server error", "internal_error", event=event)
