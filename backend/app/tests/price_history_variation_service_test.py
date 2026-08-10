from datetime import date, datetime
from decimal import Decimal
from unittest.mock import Mock

from app.repositories.price_history_repository import PriceHistoryRepository
from app.services.price_history_service import PriceHistoryService


def create_service():
    repository = Mock(spec=PriceHistoryRepository)
    service = PriceHistoryService(price_history_repository=repository)
    return service, repository


def test_get_price_variation_calculates_positive_change():
    service, repository = create_service()

    repository.get_initial_and_final_prices.return_value = {
        "initial_price": Decimal("100.00"),
        "final_price": Decimal("125.00"),
    }

    result = service.get_price_variation(" bitcoin ")

    assert result == {
        "coin_id": "bitcoin",
        "initial_price": 100.0,
        "final_price": 125.0,
        "absolute_change": 25.0,
        "percentage_change": 25.0,
        "trend": "up",
    }

    repository.get_initial_and_final_prices.assert_called_once_with(
        coin_id="bitcoin",
        start_date=None,
        end_date=None,
    )


def test_get_price_variation_calculates_negative_change():
    service, repository = create_service()

    repository.get_initial_and_final_prices.return_value = {
        "initial_price": 200,
        "final_price": 150,
    }

    result = service.get_price_variation("bitcoin")

    assert result["absolute_change"] == -50.0
    assert result["percentage_change"] == -25.0
    assert result["trend"] == "down"


def test_get_price_variation_detects_unchanged_price():
    service, repository = create_service()

    repository.get_initial_and_final_prices.return_value = {
        "initial_price": 100,
        "final_price": 100,
    }

    result = service.get_price_variation("bitcoin")

    assert result["absolute_change"] == 0.0
    assert result["percentage_change"] == 0.0
    assert result["trend"] == "unchanged"


def test_get_price_variation_handles_zero_initial_price():
    service, repository = create_service()

    repository.get_initial_and_final_prices.return_value = {
        "initial_price": 0,
        "final_price": 10,
    }

    result = service.get_price_variation("bitcoin")

    assert result["absolute_change"] == 10.0
    assert result["percentage_change"] is None
    assert result["trend"] == "up"


def test_get_price_variation_supports_date_range():
    service, repository = create_service()

    repository.get_initial_and_final_prices.return_value = {
        "initial_price": 100,
        "final_price": 110,
    }

    service.get_price_variation(
        coin_id="bitcoin",
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 10),
    )

    repository.get_initial_and_final_prices.assert_called_once_with(
        coin_id="bitcoin",
        start_date=datetime(2026, 8, 1, 0, 0, 0),
        end_date=datetime(2026, 8, 10, 23, 59, 59, 999999),
    )


def test_get_price_variation_handles_missing_history():
    service, repository = create_service()

    repository.get_initial_and_final_prices.return_value = {
        "initial_price": None,
        "final_price": None,
    }

    result = service.get_price_variation("bitcoin")

    assert result == {
        "coin_id": "bitcoin",
        "initial_price": None,
        "final_price": None,
        "absolute_change": None,
        "percentage_change": None,
        "trend": None,
    }


def test_get_price_variation_rejects_invalid_date_range():
    service, repository = create_service()

    try:
        service.get_price_variation(
            coin_id="bitcoin",
            start_date=date(2026, 8, 10),
            end_date=date(2026, 8, 1),
        )
        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "start_date cannot be greater than end_date"

    repository.get_initial_and_final_prices.assert_not_called()


if __name__ == "__main__":
    test_get_price_variation_calculates_positive_change()
    test_get_price_variation_calculates_negative_change()
    test_get_price_variation_detects_unchanged_price()
    test_get_price_variation_handles_zero_initial_price()
    test_get_price_variation_supports_date_range()
    test_get_price_variation_handles_missing_history()
    test_get_price_variation_rejects_invalid_date_range()
    print("All price history variation service tests passed.")
