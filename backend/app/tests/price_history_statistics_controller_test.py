from unittest.mock import Mock

from app.controllers.price_history_controller import PriceHistoryController
from app.services.price_history_service import PriceHistoryService


def test_get_price_statistics_delegates_to_service():
    service = Mock(spec=PriceHistoryService)
    controller = PriceHistoryController(price_history_service=service)

    expected = {
        "coin_id": "bitcoin",
        "count": 3,
        "min_price": 64000.0,
        "max_price": 65000.0,
        "average_price": 64500.0,
    }
    service.get_price_statistics.return_value = expected

    result = controller.get_price_statistics("bitcoin")

    assert result == expected
    service.get_price_statistics.assert_called_once_with("bitcoin")


if __name__ == "__main__":
    test_get_price_statistics_delegates_to_service()
    print("All price history statistics controller tests passed.")
