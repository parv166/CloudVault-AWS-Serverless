from __future__ import annotations


class CloudVaultError(Exception):
    status_code = 500
    error_code = "internal_error"


class BadRequestError(CloudVaultError):
    status_code = 400
    error_code = "bad_request"


class NotFoundError(CloudVaultError):
    status_code = 404
    error_code = "not_found"


class ConfigurationError(CloudVaultError):
    status_code = 500
    error_code = "configuration_error"
