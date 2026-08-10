from datetime import date, datetime
from decimal import Decimal
from unittest.mock import Mock

from app.repositories.price_history_repository import PriceHistoryRepository
from app.services.price_history_service import PriceHistoryService


def create_service():
    repository = Mock(spec=PriceHistoryRepository)
    service = PriceHistoryService(price_history_repository=repository)
    return service, repository


def test_get_price_aggregations_transforms_daily_rows():
    service, repository = create_service()

    repository.get_price_aggregations.return_value = [
        {
            "period": date(2026, 8, 1),
            "average_price": Decimal("105.00"),
            "min_price": Decimal("100.00"),
            "max_price": Decimal("110.00"),
            "count": 2,
        }
    ]

    result = service.get_price_aggregations(" bitcoin ")

    assert result == [
        {
            "period": "2026-08-01",
            "average_price": 105.0,
            "min_price": 100.0,
            "max_price": 110.0,
            "count": 2,
        }
    ]

    repository.get_price_aggregations.assert_called_once_with(
        coin_id="bitcoin",
        period="day",
        start_date=None,
        end_date=None,
    )


def test_get_price_aggregations_supports_week_period_and_dates():
    service, repository = create_service()
    repository.get_price_aggregations.return_value = []

    service.get_price_aggregations(
        coin_id="bitcoin",
        period="WEEK",
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 31),
    )

    repository.get_price_aggregations.assert_called_once_with(
        coin_id="bitcoin",
        period="week",
        start_date=datetime(2026, 8, 1, 0, 0, 0),
        end_date=datetime(2026, 8, 31, 23, 59, 59, 999999),
    )


def test_get_price_aggregations_returns_empty_list_without_history():
    service, repository = create_service()
    repository.get_price_aggregations.return_value = []

    result = service.get_price_aggregations("bitcoin")

    assert result == []


def test_get_price_aggregations_rejects_invalid_period():
    service, repository = create_service()

    try:
        service.get_price_aggregations("bitcoin", period="month")
        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "period must be one of: hour, day, week"

    repository.get_price_aggregations.assert_not_called()


def test_get_price_aggregations_rejects_invalid_date_range():
    service, repository = create_service()

    try:
        service.get_price_aggregations(
            coin_id="bitcoin",
            start_date=date(2026, 8, 31),
            end_date=date(2026, 8, 1),
        )
        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "start_date cannot be greater than end_date"

    repository.get_price_aggregations.assert_not_called()


if __name__ == "__main__":
    test_get_price_aggregations_transforms_daily_rows()
    test_get_price_aggregations_supports_week_period_and_dates()
    test_get_price_aggregations_returns_empty_list_without_history()
    test_get_price_aggregations_rejects_invalid_period()
    test_get_price_aggregations_rejects_invalid_date_range()
    print("All price history aggregation service tests passed.")
