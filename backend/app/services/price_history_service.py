from datetime import datetime

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

    def get_history(
        self,
        coin_id: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[PriceHistory]:

        if start_date is not None and end_date is not None and start_date > end_date:
            raise ValueError("start_date cannot be greater than end_date")

        return self.price_history_repository.get_by_coin_id_and_date_range(
            coin_id=coin_id,
            start_date=start_date,
            end_date=end_date,
        )
