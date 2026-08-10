from datetime import datetime, date, time

from app.models.price_history import PriceHistory
from app.repositories.price_history_repository import PriceHistoryRepository


VALID_SORT_FIELDS = {"recorded_at", "price"}
VALID_SORT_ORDERS = {"asc", "desc"}
VALID_AGGREGATION_PERIODS = {"hour", "day", "week"}


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
        sort_by: str = "recorded_at",
        sort_order: str = "asc",
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

        sort_by = sort_by.lower()

        if sort_by not in VALID_SORT_FIELDS:
            raise ValueError("sort_by must be one of: recorded_at, price")

        sort_order = sort_order.lower()

        if sort_order not in VALID_SORT_ORDERS:
            raise ValueError("sort_order must be one of: asc, desc")

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
            sort_by=sort_by,
            sort_order=sort_order,
        )

    def get_price_statistics(self, coin_id: str) -> dict:
        coin_id = coin_id.strip()

        if not coin_id:
            raise ValueError("coin_id cannot be empty")

        row = self.price_history_repository.get_statistics_by_coin_id(coin_id)

        if row is None:
            raise ValueError("statistics query returned no result")

        return {
            "coin_id": coin_id,
            "count": int(row["count"]),
            "min_price": self._to_float_or_none(row["min_price"]),
            "max_price": self._to_float_or_none(row["max_price"]),
            "average_price": self._to_float_or_none(row["average_price"]),
        }

    @staticmethod
    def _to_float_or_none(value) -> float | None:
        if value is None:
            return None

        return float(value)

    def get_price_variation(
        self,
        coin_id: str,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        coin_id = coin_id.strip()

        if not coin_id:
            raise ValueError("coin_id cannot be empty")

        if start_date is not None and end_date is not None:
            if start_date > end_date:
                raise ValueError("start_date cannot be greater than end_date")

        start_datetime = None

        if start_date is not None:
            start_datetime = datetime.combine(start_date, time.min)

        end_datetime = None

        if end_date is not None:
            end_datetime = datetime.combine(end_date, time.max)

        prices = self.price_history_repository.get_initial_and_final_prices(
            coin_id=coin_id,
            start_date=start_datetime,
            end_date=end_datetime,
        )

        initial_price = self._to_float_or_none(prices["initial_price"])
        final_price = self._to_float_or_none(prices["final_price"])

        if initial_price is None or final_price is None:
            return {
                "coin_id": coin_id,
                "initial_price": initial_price,
                "final_price": final_price,
                "absolute_change": None,
                "percentage_change": None,
                "trend": None,
            }

        absolute_change = final_price - initial_price

        percentage_change = None

        if initial_price != 0:
            percentage_change = (absolute_change / initial_price) * 100

        if absolute_change > 0:
            trend = "up"
        elif absolute_change < 0:
            trend = "down"
        else:
            trend = "unchanged"

        return {
            "coin_id": coin_id,
            "initial_price": initial_price,
            "final_price": final_price,
            "absolute_change": absolute_change,
            "percentage_change": percentage_change,
            "trend": trend,
        }

    def get_price_aggregations(
        self,
        coin_id: str,
        period: str = "day",
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[dict]:
        coin_id = coin_id.strip()

        if not coin_id:
            raise ValueError("coin_id cannot be empty")

        period = period.lower()

        if period not in VALID_AGGREGATION_PERIODS:
            raise ValueError("period must be one of: hour, day, week")

        if start_date is not None and end_date is not None:
            if start_date > end_date:
                raise ValueError("start_date cannot be greater than end_date")

        start_datetime = None

        if start_date is not None:
            start_datetime = datetime.combine(start_date, time.min)

        end_datetime = None

        if end_date is not None:
            end_datetime = datetime.combine(end_date, time.max)

        rows = self.price_history_repository.get_price_aggregations(
            coin_id=coin_id,
            period=period,
            start_date=start_datetime,
            end_date=end_datetime,
        )

        return [
            {
                "period": str(row["period"]),
                "average_price": self._to_float_or_none(
                    row["average_price"]
                ),
                "min_price": self._to_float_or_none(row["min_price"]),
                "max_price": self._to_float_or_none(row["max_price"]),
                "count": int(row["count"]),
            }
            for row in rows
        ]
