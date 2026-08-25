from unittest.mock import Mock

import pytest

from app.exceptions.api_exception import CoinGeckoException
from app.models.price_history import PriceHistory
from app.repositories.price_history_repository import PriceHistoryRepository
from app.services.price_history_service import PriceHistoryService


pytestmark = pytest.mark.unit


def create_service():
    repository = Mock(spec=PriceHistoryRepository)
    api_client = Mock()
    service = PriceHistoryService(repository, api_client)
    return service, repository, api_client


def test_update_current_price_fetches_and_persists_coin_gecko_price():
    service, repository, api_client = create_service()
    api_client.get_current_price.return_value = 65000.25
    repository.save.side_effect = lambda price_history: price_history

    result = service.update_current_price(" BITCOIN ")

    assert isinstance(result, PriceHistory)
    assert result.coin_id == "bitcoin"
    assert result.price == 65000.25
    api_client.get_current_price.assert_called_once_with(
        "bitcoin",
        vs_currency="usd",
    )
    repository.save.assert_called_once_with(result)


def test_update_current_price_translates_missing_external_price():
    service, repository, api_client = create_service()
    api_client.get_current_price.return_value = None

    with pytest.raises(CoinGeckoException, match="precio actual"):
        service.update_current_price("bitcoin")

    repository.save.assert_not_called()
