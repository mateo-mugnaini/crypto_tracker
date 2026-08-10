from datetime import date
from unittest.mock import Mock

from app.controllers.price_history_controller import PriceHistoryController
from app.services.price_history_service import PriceHistoryService


def test_get_price_variation_delegates_to_service():
    service = Mock(spec=PriceHistoryService)
    controller = PriceHistoryController(price_history_service=service)

    expected = {
        "coin_id": "bitcoin",
        "initial_price": 100.0,
        "final_price": 125.0,
        "absolute_change": 25.0,
        "percentage_change": 25.0,
        "trend": "up",
    }
    service.get_price_variation.return_value = expected

    result = controller.get_price_variation(
        coin_id="bitcoin",
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 10),
    )

    assert result == expected
    service.get_price_variation.assert_called_once_with(
        coin_id="bitcoin",
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 10),
    )


if __name__ == "__main__":
    test_get_price_variation_delegates_to_service()
    print("All price history variation controller tests passed.")
