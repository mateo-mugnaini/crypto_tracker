from unittest.mock import Mock, patch

import pytest

from app.repositories.coin_repository import CoinRepository


pytestmark = pytest.mark.unit


@pytest.fixture
def database_mocks():
    connection = Mock()
    cursor = Mock()
    connection.cursor.return_value = cursor
    return connection, cursor


@patch("app.repositories.coin_repository.get_connection")
def test_find_all_reads_latest_price_from_price_history(
    mock_get_connection,
    database_mocks,
):
    connection, cursor = database_mocks
    mock_get_connection.return_value = connection
    expected = [
        {
            "id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "market_cap_rank": 1,
            "current_price": 65000.25,
        }
    ]
    cursor.fetchall.return_value = expected

    result = CoinRepository().find_all()

    assert result == expected
    query = cursor.execute.call_args.args[0]
    assert "price_history" in query
    assert "AS current_price" in query
    assert "ORDER BY c.market_cap_rank ASC" in query
    cursor.close.assert_called_once_with()
    connection.close.assert_called_once_with()


@patch("app.repositories.coin_repository.get_connection")
def test_find_by_id_returns_latest_price(
    mock_get_connection,
    database_mocks,
):
    connection, cursor = database_mocks
    mock_get_connection.return_value = connection
    expected = {
        "id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin",
        "market_cap_rank": 1,
        "current_price": 65000.25,
    }
    cursor.fetchone.return_value = expected

    result = CoinRepository().find_by_id("bitcoin")

    assert result == expected
    assert cursor.execute.call_args.args[1] == ("bitcoin",)
    query = cursor.execute.call_args.args[0]
    assert "price_history" in query
    assert "AS current_price" in query
    cursor.close.assert_called_once_with()
    connection.close.assert_called_once_with()
