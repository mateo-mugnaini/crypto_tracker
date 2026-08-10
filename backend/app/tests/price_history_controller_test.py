from datetime import date
from unittest.mock import Mock

from app.controllers.price_history_controller import PriceHistoryController
from app.services.price_history_service import PriceHistoryService


def create_controller():
    service = Mock(spec=PriceHistoryService)

    controller = PriceHistoryController(price_history_service=service)

    return controller, service


def test_get_price_history_without_filters():
    controller, service = create_controller()

    service.get_price_history.return_value = []

    result = controller.get_price_history(
        coin_id="bitcoin",
    )

    assert result == []

    service.get_price_history.assert_called_once_with(
        coin_id="bitcoin",
        start_date=None,
        end_date=None,
        min_price=None,
        max_price=None,
        limit=20,
        offset=0,
        sort_by="recorded_at",
        sort_order="asc",
    )


def test_get_price_history_with_pagination():
    controller, service = create_controller()

    service.get_price_history.return_value = []

    controller.get_price_history(
        coin_id="bitcoin",
        limit=10,
        offset=20,
    )

    service.get_price_history.assert_called_once_with(
        coin_id="bitcoin",
        start_date=None,
        end_date=None,
        min_price=None,
        max_price=None,
        limit=10,
        offset=20,
        sort_by="recorded_at",
        sort_order="asc",
    )


def test_get_price_history_with_filters_and_pagination():
    controller, service = create_controller()

    service.get_price_history.return_value = []

    controller.get_price_history(
        coin_id="bitcoin",
        start_date=date(2026, 8, 7),
        end_date=date(2026, 8, 8),
        min_price=64000,
        max_price=65000,
        limit=10,
        offset=20,
        sort_by="recorded_at",
        sort_order="asc",
    )

    service.get_price_history.assert_called_once_with(
        coin_id="bitcoin",
        start_date=date(2026, 8, 7),
        end_date=date(2026, 8, 8),
        min_price=64000,
        max_price=65000,
        limit=10,
        offset=20,
        sort_by="recorded_at",
        sort_order="asc",
    )


def test_get_price_history_with_sorting():
    controller, service = create_controller()

    service.get_price_history.return_value = []

    controller.get_price_history(
        coin_id="bitcoin",
        sort_by="price",
        sort_order="desc",
    )

    service.get_price_history.assert_called_once_with(
        coin_id="bitcoin",
        start_date=None,
        end_date=None,
        min_price=None,
        max_price=None,
        limit=20,
        offset=0,
        sort_by="price",
        sort_order="desc",
    )

if __name__ == "__main__":
    test_get_price_history_without_filters()
    test_get_price_history_with_pagination()
    test_get_price_history_with_filters_and_pagination()
    test_get_price_history_with_sorting()
    print("All price history controller tests passed.")
