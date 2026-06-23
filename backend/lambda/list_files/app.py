from __future__ import annotations

import logging
from typing import Any

from cloudvault_common import storage
from cloudvault_common.config import load_config
from cloudvault_common.errors import CloudVaultError
from cloudvault_common.http import error_response, response

logger = logging.getLogger(__name__)


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    try:
        config = load_config()
        logger.setLevel(config.log_level)

        files = storage.list_metadata(table_name=config.table_name)
        files.sort(key=lambda item: item.get("upload_time", ""), reverse=True)

        logger.info("Listed files", extra={"count": len(files)})
        return response(200, {"files": files, "count": len(files)}, event=event)

    except CloudVaultError as exc:
        logger.warning("Request failed: %s", exc)
        return error_response(exc.status_code, str(exc), exc.error_code, event=event)
    except Exception:
        logger.exception("Unhandled list_files error")
        return error_response(500, "Internal server error", "internal_error", event=event)
