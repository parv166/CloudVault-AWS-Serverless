from __future__ import annotations

from typing import Any

from .errors import UnauthorizedError


def get_authenticated_user_id(event: dict[str, Any]) -> str:
    """Read the authenticated Cognito subject from API Gateway JWT claims."""
    request_context = event.get("requestContext") or {}
    authorizer = request_context.get("authorizer") or {}
    jwt = authorizer.get("jwt") or {}
    claims = jwt.get("claims") or {}

    user_id = claims.get("sub")

    if not isinstance(user_id, str) or not user_id.strip():
        raise UnauthorizedError("Authentication is required")

    return user_id.strip()
