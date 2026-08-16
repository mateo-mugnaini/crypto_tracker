from unittest.mock import Mock

import pytest

from app.exceptions.api_exception import CoinGeckoException
from app.services.coin_service import CoinService


@pytest.fixture
def repository():
    return Mock()


@pytest.fixture
def api_client():
    return Mock()


@pytest.fixture
def service(repository, api_client):
    return CoinService(repository, api_client)


@pytest.fixture
def bitcoin_payload():
    return {
        "id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin",
        "market_cap_rank": 1,
    }


def test_update_coin_saves_a_new_coin(service, repository, api_client, bitcoin_payload):
    api_client.get_coin.return_value = bitcoin_payload
    repository.exists.return_value = False

    coin = service.update_coin("bitcoin")

    assert coin.id == "bitcoin"
    api_client.get_coin.assert_called_once_with("bitcoin")
    repository.save.assert_called_once_with(coin)
    repository.update.assert_not_called()


def test_update_coin_updates_an_existing_coin(service, repository, api_client, bitcoin_payload):
    api_client.get_coin.return_value = bitcoin_payload
    repository.exists.return_value = True

    coin = service.update_coin("bitcoin")

    repository.update.assert_called_once_with(coin)
    repository.save.assert_not_called()


def test_update_coin_does_not_persist_when_external_api_returns_no_data(
    service,
    repository,
    api_client,
):
    api_client.get_coin.return_value = {}

    with pytest.raises(CoinGeckoException):
        service.update_coin("bitcoin")

    repository.exists.assert_not_called()
    repository.save.assert_not_called()
    repository.update.assert_not_called()


def test_sync_coins_saves_and_updates_each_coin(service, repository, api_client):
    api_client.get_market_coins.return_value = [
        {"id": "bitcoin", "symbol": "btc", "name": "Bitcoin", "market_cap_rank": 1},
        {"id": "ethereum", "symbol": "eth", "name": "Ethereum", "market_cap_rank": 2},
    ]
    repository.exists.side_effect = [False, True]

    coins = service.sync_coins()

    assert [coin.id for coin in coins] == ["bitcoin", "ethereum"]
    api_client.get_market_coins.assert_called_once_with(
        vs_currency="usd", per_page=10, page=1, order="market_cap_desc"
    )
    repository.save.assert_called_once_with(coins[0])
    repository.update.assert_called_once_with(coins[1])


def test_sync_coins_raises_when_external_api_returns_no_data(service, repository, api_client):
    api_client.get_market_coins.return_value = []

    with pytest.raises(CoinGeckoException):
        service.sync_coins()

    repository.exists.assert_not_called()


def test_read_operations_delegate_to_repository(service, repository):
    repository.find_all.return_value = [{"id": "bitcoin"}]
    repository.find_by_id.return_value = {"id": "bitcoin"}

    assert service.get_all_coins() == [{"id": "bitcoin"}]
    assert service.get_coin("bitcoin") == {"id": "bitcoin"}
    repository.find_all.assert_called_once_with()
    repository.find_by_id.assert_called_once_with("bitcoin")
