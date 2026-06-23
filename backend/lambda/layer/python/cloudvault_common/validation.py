from __future__ import annotations

import base64
import binascii
import re
from dataclasses import dataclass
from typing import Any

from .errors import BadRequestError

SAFE_FILE_NAME_PATTERN = re.compile(r"^[A-Za-z0-9._ -]{1,255}$")


@dataclass(frozen=True)
class UploadPayload:
    file_name: str
    file_type: str
    content: bytes
    file_size: int


def _require_string(payload: dict[str, Any], field_name: str) -> str:
    value = payload.get(field_name)
    if not isinstance(value, str) or not value.strip():
        raise BadRequestError(f"'{field_name}' is required")
    return value.strip()


def validate_file_name(file_name: str) -> str:
    if "/" in file_name or "\\" in file_name:
        raise BadRequestError("File name must not contain path separators")

    if file_name in {".", ".."} or not SAFE_FILE_NAME_PATTERN.fullmatch(file_name):
        raise BadRequestError(
            "File name may only contain letters, numbers, spaces, dots, underscores, and hyphens"
        )
    return file_name


def validate_file_type(file_type: str, allowed_file_types: tuple[str, ...]) -> str:
    normalized = file_type.lower()
    if normalized not in allowed_file_types:
        allowed = ", ".join(allowed_file_types)
        raise BadRequestError(f"File type '{file_type}' is not allowed. Allowed types: {allowed}")
    return normalized


def decode_content(content_base64: str) -> bytes:
    try:
        return base64.b64decode(content_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise BadRequestError("'content_base64' must be valid base64") from exc


def validate_file_size(content: bytes, max_file_size_bytes: int) -> int:
    file_size = len(content)
    if file_size == 0:
        raise BadRequestError("File content must not be empty")

    if file_size > max_file_size_bytes:
        raise BadRequestError(
            f"File size {file_size} bytes exceeds the {max_file_size_bytes} byte limit"
        )
    return file_size


def parse_upload_payload(
    payload: dict[str, Any],
    allowed_file_types: tuple[str, ...],
    max_file_size_bytes: int,
) -> UploadPayload:
    file_name = validate_file_name(_require_string(payload, "file_name"))
    file_type = validate_file_type(_require_string(payload, "file_type"), allowed_file_types)
    content = decode_content(_require_string(payload, "content_base64"))
    file_size = validate_file_size(content, max_file_size_bytes)

    return UploadPayload(
        file_name=file_name,
        file_type=file_type,
        content=content,
        file_size=file_size,
    )
