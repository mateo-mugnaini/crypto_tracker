from datetime import date
from unittest.mock import Mock

from app.controllers.price_history_controller import PriceHistoryController
from app.services.price_history_service import PriceHistoryService


def test_get_price_aggregations_delegates_to_service():
    service = Mock(spec=PriceHistoryService)
    controller = PriceHistoryController(price_history_service=service)

    expected = [
        {
            "period": "2026-08-01",
            "average_price": 105.0,
            "min_price": 100.0,
            "max_price": 110.0,
            "count": 2,
        }
    ]
    service.get_price_aggregations.return_value = expected

    result = controller.get_price_aggregations(
        coin_id="bitcoin",
        period="day",
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 31),
    )

    assert result == expected
    service.get_price_aggregations.assert_called_once_with(
        coin_id="bitcoin",
        period="day",
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 31),
    )


if __name__ == "__main__":
    test_get_price_aggregations_delegates_to_service()
    print("All price history aggregation controller tests passed.")
