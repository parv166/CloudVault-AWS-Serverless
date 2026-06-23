from __future__ import annotations

import os
from typing import Any

import boto3
from botocore.config import Config

from .errors import NotFoundError


_s3_client = None
_dynamodb_resource = None


def get_s3_client():
    global _s3_client

    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            region_name=os.environ.get(
                "AWS_REGION",
                "ap-south-1",
            ),
            config=Config(
                signature_version="s3v4",
                s3={
                    "addressing_style": "virtual",
                },
            ),
        )

    return _s3_client


def get_dynamodb_resource():
    global _dynamodb_resource

    if _dynamodb_resource is None:
        _dynamodb_resource = boto3.resource(
            "dynamodb"
        )

    return _dynamodb_resource


def get_table(table_name: str):
    return get_dynamodb_resource().Table(
        table_name
    )


def upload_object(
    *,
    bucket_name: str,
    key: str,
    content: bytes,
    content_type: str,
    file_id: str,
    sse_algorithm: str | None,
) -> None:

    args: dict[str, Any] = {
        "Bucket": bucket_name,
        "Key": key,
        "Body": content,
        "ContentType": content_type,
        "Metadata": {
            "file-id": file_id
        },
    }

    if sse_algorithm:
        args["ServerSideEncryption"] = (
            sse_algorithm
        )

    get_s3_client().put_object(**args)


def delete_object(
    *,
    bucket_name: str,
    key: str,
) -> None:

    get_s3_client().delete_object(
        Bucket=bucket_name,
        Key=key,
    )


def save_metadata(
    *,
    table_name: str,
    metadata: dict[str, Any],
) -> None:

    get_table(table_name).put_item(
        Item=metadata
    )


def list_metadata(
    *,
    table_name: str,
) -> list[dict[str, Any]]:

    table = get_table(table_name)

    items = []
    scan_kwargs = {}

    while True:
        result = table.scan(
            **scan_kwargs
        )

        items.extend(
            result.get("Items", [])
        )

        last_key = result.get(
            "LastEvaluatedKey"
        )

        if not last_key:
            break

        scan_kwargs[
            "ExclusiveStartKey"
        ] = last_key

    return items


def get_metadata(
    *,
    table_name: str,
    file_id: str,
) -> dict[str, Any]:

    result = get_table(
        table_name
    ).get_item(
        Key={
            "file_id": file_id
        }
    )

    item = result.get("Item")

    if not item:
        raise NotFoundError(
            f"File '{file_id}' was not found"
        )

    return item


def delete_metadata(
    *,
    table_name: str,
    file_id: str,
) -> None:

    get_table(
        table_name
    ).delete_item(
        Key={
            "file_id": file_id
        }
    )


def create_download_url(
    *,
    bucket_name: str,
    key: str,
    expires_in_seconds: int,
) -> str:

    return get_s3_client().generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": bucket_name,
            "Key": key,
        },
        ExpiresIn=expires_in_seconds,
        HttpMethod="GET",
    )
