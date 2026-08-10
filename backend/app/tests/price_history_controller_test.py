from datetime import datetime

from app.controllers.price_history_controller import PriceHistoryController


class FakePriceHistoryService:

    def __init__(self):
        self.received_coin_id = None
        self.received_start_date = None
        self.received_end_date = None

    def get_history(
        self,
        coin_id,
        start_date=None,
        end_date=None,
    ):
        self.received_coin_id = coin_id
        self.received_start_date = start_date
        self.received_end_date = end_date

        return []


def test_controller_get_history_with_date_range():
    service = FakePriceHistoryService()
    controller = PriceHistoryController(service)

    start_date = datetime(2026, 8, 1)
    end_date = datetime(2026, 8, 9)

    result = controller.get_history(
        coin_id="bitcoin",
        start_date=start_date,
        end_date=end_date,
    )

    assert result == []

    assert service.received_coin_id == "bitcoin"
    assert service.received_start_date == start_date
    assert service.received_end_date == end_date


def test_controller_get_history_without_dates():
    service = FakePriceHistoryService()
    controller = PriceHistoryController(service)

    result = controller.get_history(
        coin_id="bitcoin",
    )

    assert result == []

    assert service.received_coin_id == "bitcoin"
    assert service.received_start_date is None
    assert service.received_end_date is None


if __name__ == "__main__":
    test_controller_get_history_with_date_range()
    test_controller_get_history_without_dates()

    print("PriceHistoryController tests passed.")
