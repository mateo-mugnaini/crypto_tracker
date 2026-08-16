from unittest.mock import MagicMock, Mock, patch

import requests

from app.api.coingecko_client import CoinGeckoClient
from app.repositories.coin_repository import CoinRepository


@patch("app.api.coingecko_client.requests.get")
def test_patch_replaces_requests_get_and_returns_a_coin(mock_get):
    response = Mock()
    response.json.return_value = {"id": "bitcoin", "name": "Bitcoin"}
    mock_get.return_value = response
    client = CoinGeckoClient(base_url="https://example.test", timeout=3)

    coin = client.get_coin("bitcoin")

    assert coin == {"id": "bitcoin", "name": "Bitcoin"}
    mock_get.assert_called_once_with(
        "https://example.test/coins/bitcoin",
        params=None,
        timeout=3,
    )
    response.raise_for_status.assert_called_once_with()
    response.json.assert_called_once_with()


@patch("app.api.coingecko_client.requests.get")
def test_side_effect_simulates_timeout_without_calling_the_network(mock_get):
    mock_get.side_effect = requests.exceptions.Timeout
    client = CoinGeckoClient(base_url="https://example.test", timeout=3)

    coin = client.get_coin("bitcoin")

    assert coin == {}
    mock_get.assert_called_once_with(
        "https://example.test/coins/bitcoin",
        params=None,
        timeout=3,
    )


@patch("app.repositories.coin_repository.get_connection")
def test_magic_mock_can_represent_the_indexable_database_row(mock_get_connection):
    connection = Mock()
    cursor = Mock()
    row = MagicMock()
    row.__getitem__.return_value = 1
    connection.cursor.return_value = cursor
    cursor.fetchone.return_value = row
    mock_get_connection.return_value = connection
    repository = CoinRepository()

    exists = repository.exists("bitcoin")

    assert exists is True
    cursor.execute.assert_called_once()
    cursor.close.assert_called_once_with()
    connection.close.assert_called_once_with()
    row.__getitem__.assert_called_once_with(0)
