from datetime import datetime

from app.services.price_history_service import PriceHistoryService


class FakePriceHistoryRepository:

    def __init__(self):
        self.received_coin_id = None
        self.received_start_date = None
        self.received_end_date = None

    def get_by_coin_id_and_date_range(
        self,
        coin_id,
        start_date=None,
        end_date=None,
    ):
        self.received_coin_id = coin_id
        self.received_start_date = start_date
        self.received_end_date = end_date

        return []


def test_get_history_with_date_range():
    repository = FakePriceHistoryRepository()
    service = PriceHistoryService(repository)

    start_date = datetime(2026, 8, 1)
    end_date = datetime(2026, 8, 9)

    result = service.get_history(
        coin_id="bitcoin",
        start_date=start_date,
        end_date=end_date,
    )

    assert result == []

    assert repository.received_coin_id == "bitcoin"
    assert repository.received_start_date == start_date
    assert repository.received_end_date == end_date


def test_get_history_without_dates():
    repository = FakePriceHistoryRepository()
    service = PriceHistoryService(repository)

    result = service.get_history(
        coin_id="bitcoin",
    )

    assert result == []

    assert repository.received_coin_id == "bitcoin"
    assert repository.received_start_date is None
    assert repository.received_end_date is None


def test_get_history_with_invalid_date_range():
    repository = FakePriceHistoryRepository()
    service = PriceHistoryService(repository)

    start_date = datetime(2026, 8, 10)
    end_date = datetime(2026, 8, 1)

    try:
        service.get_history(
            coin_id="bitcoin",
            start_date=start_date,
            end_date=end_date,
        )

        raise AssertionError("Expected ValueError was not raised")

    except ValueError as error:
        assert str(error) == ("start_date cannot be greater than end_date")


if __name__ == "__main__":
    test_get_history_with_date_range()
    test_get_history_without_dates()
    test_get_history_with_invalid_date_range()

    print("PriceHistoryService tests passed.")
