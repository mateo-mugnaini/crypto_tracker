from datetime import datetime
from unittest.mock import Mock, patch

import pytest

from app.models.user import User
from app.repositories.user_repository import UserRepository


pytestmark = pytest.mark.unit


@pytest.fixture
def database_mocks():
    connection = Mock()
    cursor = Mock()
    connection.cursor.return_value = cursor
    return connection, cursor


@patch("app.repositories.user_repository.get_connection")
def test_user_repository_save_uses_parameterized_values(
    mock_get_connection,
    database_mocks,
):
    connection, cursor = database_mocks
    mock_get_connection.return_value = connection
    user = User(
        id=None,
        username="mateo",
        email="mateo@example.test",
        password_hash="stored-hash",
        created_at=datetime(2026, 8, 16, 12, 0),
    )

    UserRepository().save(user)

    _, values = cursor.execute.call_args.args
    assert values == (
        "mateo",
        "mateo@example.test",
        "stored-hash",
        datetime(2026, 8, 16, 12, 0),
    )
    connection.commit.assert_called_once_with()
    cursor.close.assert_called_once_with()
    connection.close.assert_called_once_with()


@patch("app.repositories.user_repository.get_connection")
def test_user_repository_find_by_id_returns_database_row(
    mock_get_connection,
    database_mocks,
):
    connection, cursor = database_mocks
    mock_get_connection.return_value = connection
    expected = {"id": 1, "username": "mateo"}
    cursor.fetchone.return_value = expected

    result = UserRepository().find_by_id(1)

    assert result == expected
    cursor.execute.assert_called_once()
    assert cursor.execute.call_args.args[1] == (1,)
    cursor.close.assert_called_once_with()
    connection.close.assert_called_once_with()


@patch("app.repositories.user_repository.get_connection")
@pytest.mark.parametrize(
    ("database_result", "expected"),
    [(None, False), ((1,), True)],
)
def test_user_repository_exists_returns_boolean(
    mock_get_connection,
    database_result,
    expected,
    database_mocks,
):
    connection, cursor = database_mocks
    mock_get_connection.return_value = connection
    cursor.fetchone.return_value = database_result

    assert UserRepository().exists(1) is expected
    assert cursor.execute.call_args.args[1] == (1,)
