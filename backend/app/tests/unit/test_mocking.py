from unittest.mock import Mock, patch

import pytest
import requests

from app.api.coingecko_client import CoinGeckoClient
from app.repositories.coin_repository import CoinRepository


pytestmark = pytest.mark.unit


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
def test_coin_gecko_client_reads_current_usd_price(mock_get):
    response = Mock()
    response.json.return_value = {"bitcoin": {"usd": 65000.25}}
    mock_get.return_value = response
    client = CoinGeckoClient(base_url="https://example.test", timeout=3)

    price = client.get_current_price("bitcoin")

    assert price == 65000.25
    mock_get.assert_called_once_with(
        "https://example.test/simple/price",
        params={"ids": "bitcoin", "vs_currencies": "usd"},
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
def test_coin_repository_exists_uses_short_circuit_query(mock_get_connection):
    connection = Mock()
    cursor = Mock()
    connection.cursor.return_value = cursor
    cursor.fetchone.return_value = (1,)
    mock_get_connection.return_value = connection
    repository = CoinRepository()

    exists = repository.exists("bitcoin")

    assert exists is True
    cursor.execute.assert_called_once()
    query, params = cursor.execute.call_args.args
    assert "SELECT 1" in query
    assert "LIMIT 1" in query
    assert params == ("bitcoin",)
    cursor.close.assert_called_once_with()
    connection.close.assert_called_once_with()
