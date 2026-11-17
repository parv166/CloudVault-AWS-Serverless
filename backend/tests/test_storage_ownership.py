import pytest

from cloudvault_common import storage
from cloudvault_common.errors import NotFoundError


class FakeTable:
    def __init__(self):
        self.records = {
            ("user-A", "file-123"): {
                "user_id": "user-A",
                "file_id": "file-123",
                "file_name": "private.pdf",
            }
        }
        self.query_kwargs = None
        self.deleted_key = None

    def query(self, **kwargs):
        self.query_kwargs = kwargs
        return {
            "Items": [
                item
                for (owner, _), item in self.records.items()
                if owner == "user-A"
            ]
        }

    def get_item(self, Key):
        return {"Item": self.records.get(
            (Key["user_id"], Key["file_id"])
        )}

    def delete_item(self, Key):
        self.deleted_key = Key
        self.records.pop((Key["user_id"], Key["file_id"]), None)


def test_list_metadata_queries_user_partition(monkeypatch):
    table = FakeTable()
    monkeypatch.setattr(storage, "get_table", lambda _: table)

    files = storage.list_metadata(
        table_name="test-table",
        user_id="user-A",
    )

    expression = table.query_kwargs["KeyConditionExpression"]
    values = expression.get_expression()["values"]

    assert values[0].name == "user_id"
    assert values[1] == "user-A"
    assert len(files) == 1


def test_user_cannot_access_another_users_file(monkeypatch):
    table = FakeTable()
    monkeypatch.setattr(storage, "get_table", lambda _: table)

    with pytest.raises(NotFoundError):
        storage.get_metadata(
            table_name="test-table",
            user_id="user-B",
            file_id="file-123",
        )


def test_owner_can_access_their_file(monkeypatch):
    table = FakeTable()
    monkeypatch.setattr(storage, "get_table", lambda _: table)

    result = storage.get_metadata(
        table_name="test-table",
        user_id="user-A",
        file_id="file-123",
    )

    assert result["file_name"] == "private.pdf"


def test_delete_uses_composite_owner_key(monkeypatch):
    table = FakeTable()
    monkeypatch.setattr(storage, "get_table", lambda _: table)

    storage.delete_metadata(
        table_name="test-table",
        user_id="user-A",
        file_id="file-123",
    )

    assert table.deleted_key == {
        "user_id": "user-A",
        "file_id": "file-123",
    }
