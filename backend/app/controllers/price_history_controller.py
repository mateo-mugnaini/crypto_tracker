from datetime import date

from app.models.price_history import PriceHistory
from app.services.price_history_service import PriceHistoryService


class PriceHistoryController:

    def __init__(
        self,
        price_history_service: PriceHistoryService,
    ):
        self.price_history_service = price_history_service

    def save_price(
        self,
        coin_id: str,
        price: float,
    ) -> PriceHistory:

        return self.price_history_service.save_price(
            coin_id=coin_id,
            price=price,
        )

    def get_price_history(
        self,
        coin_id: str,
        start_date: date | None = None,
        end_date: date | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        limit: int = 20,
        offset: int = 0,
        sort_by: str = "recorded_at",
        sort_order: str = "asc",
    ) -> list[PriceHistory]:

        return self.price_history_service.get_price_history(
            coin_id=coin_id,
            start_date=start_date,
            end_date=end_date,
            min_price=min_price,
            max_price=max_price,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    def get_price_statistics(self, coin_id: str) -> dict:
        return self.price_history_service.get_price_statistics(coin_id)

    def get_price_variation(
        self,
        coin_id: str,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        return self.price_history_service.get_price_variation(
            coin_id=coin_id,
            start_date=start_date,
            end_date=end_date,
        )
