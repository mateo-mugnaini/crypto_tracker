from datetime import date, datetime
from unittest.mock import Mock

from app.models.price_history import PriceHistory
from app.repositories.price_history_repository import PriceHistoryRepository
from app.services.price_history_service import PriceHistoryService


def create_service():
    repository = Mock(spec=PriceHistoryRepository)

    service = PriceHistoryService(price_history_repository=repository)
    return service, repository


def test_get_price_history_without_filters():
    service, repository = create_service()

    expected = [
        PriceHistory(
            id=1,
            coin_id="bitcoin",
            price=65000,
            recorded_at=datetime(2026, 8, 8, 10, 0, 0),
        )
    ]

    repository.find_by_coin_id.return_value = expected

    result = service.get_price_history(
        coin_id="bitcoin",
    )

    assert result == expected

    repository.find_by_coin_id.assert_called_once_with(
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


def test_get_price_history_with_min_price():
    service, repository = create_service()

    repository.find_by_coin_id.return_value = []

    service.get_price_history(
        coin_id="bitcoin",
        min_price=64000,
    )

    repository.find_by_coin_id.assert_called_once_with(
        coin_id="bitcoin",
        start_date=None,
        end_date=None,
        min_price=64000,
        max_price=None,
        limit=20,
        offset=0,
        sort_by="recorded_at",
        sort_order="asc",
    )


def test_get_price_history_with_max_price():
    service, repository = create_service()

    repository.find_by_coin_id.return_value = []

    service.get_price_history(
        coin_id="bitcoin",
        max_price=65000,
    )

    repository.find_by_coin_id.assert_called_once_with(
        coin_id="bitcoin",
        start_date=None,
        end_date=None,
        min_price=None,
        max_price=65000,
        limit=20,
        offset=0,
        sort_by="recorded_at",
        sort_order="asc",
    )


def test_get_price_history_with_price_range():
    service, repository = create_service()

    repository.find_by_coin_id.return_value = []

    service.get_price_history(
        coin_id="bitcoin",
        min_price=64000,
        max_price=65000,
    )

    repository.find_by_coin_id.assert_called_once_with(
        coin_id="bitcoin",
        start_date=None,
        end_date=None,
        min_price=64000,
        max_price=65000,
        limit=20,
        offset=0,
        sort_by="recorded_at",
        sort_order="asc",
    )


def test_get_price_history_with_pagination():
    service, repository = create_service()

    repository.find_by_coin_id.return_value = []

    service.get_price_history(
        coin_id="bitcoin",
        limit=10,
        offset=20,
    )

    repository.find_by_coin_id.assert_called_once_with(
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
    service, repository = create_service()

    repository.find_by_coin_id.return_value = []

    service.get_price_history(
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

    repository.find_by_coin_id.assert_called_once_with(
        coin_id="bitcoin",
        start_date=datetime(2026, 8, 7, 0, 0, 0),
        end_date=datetime(2026, 8, 8, 23, 59, 59, 999999),
        min_price=64000,
        max_price=65000,
        limit=10,
        offset=20,
        sort_by="recorded_at",
        sort_order="asc",
    )


def test_get_price_history_rejects_invalid_price_range():
    service, repository = create_service()

    try:
        service.get_price_history(
            coin_id="bitcoin",
            min_price=65000,
            max_price=64000,
        )

        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == ("min_price cannot be greater than max_price")

    repository.find_by_coin_id.assert_not_called()


def test_get_price_history_rejects_invalid_date_range():
    service, repository = create_service()

    try:
        service.get_price_history(
            coin_id="bitcoin",
            start_date=date(2026, 8, 8),
            end_date=date(2026, 8, 7),
        )

        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == ("start_date cannot be greater than end_date")

    repository.find_by_coin_id.assert_not_called()


def test_get_price_history_rejects_invalid_limit():
    service, repository = create_service()

    try:
        service.get_price_history(
            coin_id="bitcoin",
            limit=0,
        )

        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "limit must be greater than 0"

    repository.find_by_coin_id.assert_not_called()


def test_get_price_history_rejects_negative_offset():
    service, repository = create_service()

    try:
        service.get_price_history(
            coin_id="bitcoin",
            offset=-1,
        )

        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "offset cannot be negative"

    repository.find_by_coin_id.assert_not_called()


def test_get_price_history_with_price_desc_sorting():
    service, repository = create_service()

    repository.find_by_coin_id.return_value = []

    service.get_price_history(
        coin_id="bitcoin",
        sort_by="price",
        sort_order="desc",
    )

    repository.find_by_coin_id.assert_called_once_with(
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


def test_get_price_history_normalizes_sorting_values():
    service, repository = create_service()

    repository.find_by_coin_id.return_value = []

    service.get_price_history(
        coin_id="bitcoin",
        sort_by="PRICE",
        sort_order="DESC",
    )

    repository.find_by_coin_id.assert_called_once_with(
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


def test_get_price_history_rejects_invalid_sort_by():
    service, repository = create_service()

    try:
        service.get_price_history(
            coin_id="bitcoin",
            sort_by="price; DROP TABLE price_history",
        )

        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "sort_by must be one of: recorded_at, price"

    repository.find_by_coin_id.assert_not_called()


def test_get_price_history_rejects_invalid_sort_order():
    service, repository = create_service()

    try:
        service.get_price_history(
            coin_id="bitcoin",
            sort_order="descending",
        )

        assert False, "Expected ValueError"

    except ValueError as error:
        assert str(error) == "sort_order must be one of: asc, desc"

    repository.find_by_coin_id.assert_not_called()


if __name__ == "__main__":
    test_get_price_history_without_filters()
    test_get_price_history_with_min_price()
    test_get_price_history_with_max_price()
    test_get_price_history_with_price_range()
    test_get_price_history_with_pagination()
    test_get_price_history_with_filters_and_pagination()
    test_get_price_history_rejects_invalid_price_range()
    test_get_price_history_rejects_invalid_date_range()
    test_get_price_history_rejects_invalid_limit()
    test_get_price_history_rejects_negative_offset()
    test_get_price_history_with_price_desc_sorting()
    test_get_price_history_normalizes_sorting_values()
    test_get_price_history_rejects_invalid_sort_by()
    test_get_price_history_rejects_invalid_sort_order()

    print("All price history service tests passed.")
