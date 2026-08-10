from datetime import datetime, date, time

from app.models.price_history import PriceHistory
from app.repositories.price_history_repository import PriceHistoryRepository


class PriceHistoryService:

    def __init__(
        self,
        price_history_repository: PriceHistoryRepository,
    ):
        self.price_history_repository = price_history_repository

    def save_price(
        self,
        coin_id: str,
        price: float,
    ) -> PriceHistory:

        price_history = PriceHistory(
            id=None,
            coin_id=coin_id,
            price=price,
            recorded_at=datetime.now(),
        )

        return self.price_history_repository.save(price_history)

    def get_price_history(
        self,
        coin_id: str,
        start_date: date | None = None,
        end_date: date | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[PriceHistory]:

        if start_date is not None and end_date is not None:
            if start_date > end_date:
                raise ValueError("start_date cannot be greater than end_date")

        if min_price is not None and max_price is not None:
            if min_price > max_price:
                raise ValueError("min_price cannot be greater than max_price")

        if limit <= 0:
            raise ValueError("limit must be greater than 0")

        if offset < 0:
            raise ValueError("offset cannot be negative")

        start_datetime = None

        if start_date is not None:
            start_datetime = datetime.combine(
                start_date,
                time.min,
            )

        end_datetime = None

        if end_date is not None:
            end_datetime = datetime.combine(
                end_date,
                time.max,
            )

        return self.price_history_repository.find_by_coin_id(
            coin_id=coin_id,
            start_date=start_datetime,
            end_date=end_datetime,
            min_price=min_price,
            max_price=max_price,
            limit=limit,
            offset=offset,
        )
