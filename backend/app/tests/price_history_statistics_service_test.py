from decimal import Decimal
from unittest.mock import Mock

from app.repositories.price_history_repository import PriceHistoryRepository
from app.services.price_history_service import PriceHistoryService


def create_service():
    repository = Mock(spec=PriceHistoryRepository)
    service = PriceHistoryService(price_history_repository=repository)
    return service, repository


def test_get_price_statistics_returns_aggregated_values():
    service, repository = create_service()

    repository.get_statistics_by_coin_id.return_value = {
        "count": 3,
        "min_price": Decimal("64000.00"),
        "max_price": Decimal("65000.00"),
        "average_price": Decimal("64500.00"),
    }

    result = service.get_price_statistics(" bitcoin ")

    assert result == {
        "coin_id": "bitcoin",
        "count": 3,
        "min_price": 64000.0,
        "max_price": 65000.0,
        "average_price": 64500.0,
    }

    repository.get_statistics_by_coin_id.assert_called_once_with("bitcoin")


def test_get_price_statistics_supports_coin_without_history():
    service, repository = create_service()

    repository.get_statistics_by_coin_id.return_value = {
        "count": 0,
        "min_price": None,
        "max_price": None,
        "average_price": None,
    }

    result = service.get_price_statistics("dogecoin")

    assert result == {
        "coin_id": "dogecoin",
        "count": 0,
        "min_price": None,
        "max_price": None,
        "average_price": None,
    }


def test_get_price_statistics_rejects_empty_coin_id():
    service, repository = create_service()

    try:
        service.get_price_statistics("   ")
        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "coin_id cannot be empty"

    repository.get_statistics_by_coin_id.assert_not_called()


def test_get_price_statistics_rejects_missing_repository_result():
    service, repository = create_service()

    repository.get_statistics_by_coin_id.return_value = None

    try:
        service.get_price_statistics("bitcoin")
        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "statistics query returned no result"


if __name__ == "__main__":
    test_get_price_statistics_returns_aggregated_values()
    test_get_price_statistics_supports_coin_without_history()
    test_get_price_statistics_rejects_empty_coin_id()
    test_get_price_statistics_rejects_missing_repository_result()
    print("All price history statistics service tests passed.")
