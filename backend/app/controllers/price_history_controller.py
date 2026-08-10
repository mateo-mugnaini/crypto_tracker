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
    ):
        return self.price_history_service.get_price_history(
            coin_id=coin_id,
            start_date=start_date,
            end_date=end_date,
            min_price=min_price,
            max_price=max_price,
        )
