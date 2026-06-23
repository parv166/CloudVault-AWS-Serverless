from __future__ import annotations

import logging
from typing import Any

from cloudvault_common import storage
from cloudvault_common.config import load_config
from cloudvault_common.errors import CloudVaultError
from cloudvault_common.http import error_response, get_path_parameter, response

logger = logging.getLogger(__name__)


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    try:
        config = load_config()
        logger.setLevel(config.log_level)

        file_id = get_path_parameter(event, "id")
        metadata = storage.get_metadata(table_name=config.table_name, file_id=file_id)

        storage.delete_object(bucket_name=config.bucket_name, key=metadata["s3_key"])
        storage.delete_metadata(table_name=config.table_name, file_id=file_id)

        logger.info("Deleted file", extra={"file_id": file_id})
        return response(200, {"message": "File deleted", "file_id": file_id}, event=event)

    except CloudVaultError as exc:
        logger.warning("Request failed: %s", exc)
        return error_response(exc.status_code, str(exc), exc.error_code, event=event)
    except KeyError:
        logger.exception("Metadata record is missing s3_key")
        return error_response(500, "File metadata is incomplete", "metadata_error", event=event)
    except Exception:
        logger.exception("Unhandled delete_file error")
        return error_response(500, "Internal server error", "internal_error", event=event)
