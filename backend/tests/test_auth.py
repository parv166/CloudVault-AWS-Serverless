import pytest

from cloudvault_common.auth import get_authenticated_user_id
from cloudvault_common.errors import UnauthorizedError


def test_extracts_cognito_user_id():
    event = {
        "requestContext": {
            "authorizer": {
                "jwt": {
                    "claims": {"sub": "user-123"}
                }
            }
        }
    }

    assert get_authenticated_user_id(event) == "user-123"


@pytest.mark.parametrize("event", [
    {},
    {"requestContext": {}},
    {"requestContext": {"authorizer": {"jwt": {"claims": {}}}}},
    {"requestContext": {"authorizer": {"jwt": {"claims": {"sub": " "}}}}},
])
def test_rejects_missing_or_empty_identity(event):
    with pytest.raises(UnauthorizedError):
        get_authenticated_user_id(event)
