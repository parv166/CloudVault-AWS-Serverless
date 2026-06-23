from __future__ import annotations

import base64
import json
import os
from decimal import Decimal
from typing import Any

from .errors import BadRequestError

DEFAULT_CORS_ALLOWED_METHODS = "GET,POST,DELETE,OPTIONS"
DEFAULT_CORS_ALLOWED_HEADERS = "Content-Type,Authorization"


def _json_default(value: Any) -> int | float:
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def _request_origin(event: dict[str, Any] | None) -> str | None:
    headers = (event or {}).get("headers") or {}
    for key, value in headers.items():
        if key.lower() == "origin" and value:
            return str(value)
    return None


def _allowed_origins() -> list[str]:
    raw_value = os.getenv("CORS_ALLOWED_ORIGINS") or os.getenv("CORS_ALLOWED_ORIGIN") or "*"
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


def _cors_origin(event: dict[str, Any] | None) -> str:
    allowed_origins = _allowed_origins()
    request_origin = _request_origin(event)

    if "*" in allowed_origins:
        return "*"

    if request_origin and request_origin in allowed_origins:
        return request_origin

    return allowed_origins[0] if allowed_origins else "*"


def _cors_headers(event: dict[str, Any] | None) -> dict[str, str]:
    origin = _cors_origin(event)
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": os.getenv(
            "CORS_ALLOWED_HEADERS",
            DEFAULT_CORS_ALLOWED_HEADERS,
        ),
        "Access-Control-Allow-Methods": os.getenv(
            "CORS_ALLOWED_METHODS",
            DEFAULT_CORS_ALLOWED_METHODS,
        ),
    }

    if origin != "*":
        headers["Vary"] = "Origin"

    return headers


def response(
    status_code: int,
    body: dict[str, Any] | None = None,
    event: dict[str, Any] | None = None,
) -> dict[str, Any]:
    headers = _cors_headers(event)

    if status_code == 204:
        return {"statusCode": status_code, "headers": headers, "body": ""}

    return {
        "statusCode": status_code,
        "headers": headers,
        "body": json.dumps(body or {}, default=_json_default),
    }


def error_response(
    status_code: int,
    message: str,
    error_code: str,
    event: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return response(
        status_code,
        {
            "error": {
                "code": error_code,
                "message": message,
            }
        },
        event=event,
    )


def parse_json_body(event: dict[str, Any]) -> dict[str, Any]:
    body = event.get("body")
    if body is None or body == "":
        raise BadRequestError("Request body is required")

    if event.get("isBase64Encoded"):
        try:
            body = base64.b64decode(body).decode("utf-8")
        except (ValueError, UnicodeDecodeError) as exc:
            raise BadRequestError("Request body is not valid base64 encoded JSON") from exc

    try:
        parsed = json.loads(body)
    except json.JSONDecodeError as exc:
        raise BadRequestError("Request body must be valid JSON") from exc

    if not isinstance(parsed, dict):
        raise BadRequestError("Request body must be a JSON object")
    return parsed


def get_path_parameter(event: dict[str, Any], name: str) -> str:
    path_parameters = event.get("pathParameters") or {}
    value = path_parameters.get(name)

    if not value:
        raise BadRequestError(f"Path parameter '{name}' is required")
    return str(value)
