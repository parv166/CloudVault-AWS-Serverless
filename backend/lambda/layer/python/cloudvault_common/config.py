from __future__ import annotations

import os
from dataclasses import dataclass

from .errors import ConfigurationError

DEFAULT_ALLOWED_FILE_TYPES = (
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
)
DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
DEFAULT_PRESIGNED_URL_TTL_SECONDS = 900


@dataclass(frozen=True)
class AppConfig:
    bucket_name: str
    table_name: str
    allowed_file_types: tuple[str, ...]
    max_file_size_bytes: int
    presigned_url_ttl_seconds: int
    log_level: str
    s3_sse_algorithm: str | None


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ConfigurationError(f"Missing required environment variable: {name}")
    return value


def _int_env(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default

    try:
        value = int(raw_value)
    except ValueError as exc:
        raise ConfigurationError(f"Environment variable {name} must be an integer") from exc

    if value <= 0:
        raise ConfigurationError(f"Environment variable {name} must be greater than zero")
    return value


def _allowed_file_types() -> tuple[str, ...]:
    raw_value = os.getenv("ALLOWED_FILE_TYPES")
    if not raw_value:
        return DEFAULT_ALLOWED_FILE_TYPES

    values = tuple(item.strip().lower() for item in raw_value.split(",") if item.strip())
    if not values:
        raise ConfigurationError("ALLOWED_FILE_TYPES must contain at least one MIME type")
    return values


def load_config() -> AppConfig:
    sse_algorithm = os.getenv("S3_SSE_ALGORITHM", "AES256").strip() or None

    return AppConfig(
        bucket_name=_required_env("CLOUDVAULT_BUCKET"),
        table_name=_required_env("CLOUDVAULT_TABLE"),
        allowed_file_types=_allowed_file_types(),
        max_file_size_bytes=_int_env("MAX_FILE_SIZE_BYTES", DEFAULT_MAX_FILE_SIZE_BYTES),
        presigned_url_ttl_seconds=_int_env(
            "PRESIGNED_URL_TTL_SECONDS",
            DEFAULT_PRESIGNED_URL_TTL_SECONDS,
        ),
        log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
        s3_sse_algorithm=sse_algorithm,
    )
