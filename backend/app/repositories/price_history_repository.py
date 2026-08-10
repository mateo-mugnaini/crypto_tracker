from datetime import datetime

from app.models.price_history import PriceHistory
from app.database.connection import get_connection


SORTABLE_FIELDS = {
    "recorded_at": "recorded_at",
    "price": "price",
}

SORT_DIRECTIONS = {
    "asc": "ASC",
    "desc": "DESC",
}


class PriceHistoryRepository:

    @staticmethod
    def _get_sorting_sql(sort_by: str, sort_order: str) -> tuple[str, str]:
        """Translate public sorting values into trusted SQL fragments."""

        column = SORTABLE_FIELDS.get(sort_by)

        if column is None:
            raise ValueError("sort_by must be one of: recorded_at, price")

        direction = SORT_DIRECTIONS.get(sort_order)

        if direction is None:
            raise ValueError("sort_order must be one of: asc, desc")

        return column, direction

    def save(self, price_history: PriceHistory) -> PriceHistory:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO price_history(
                coin_id,
                price,
                recorded_at
            )
            VALUES (%s, %s, %s)
        """

        values = (
            price_history.coin_id,
            price_history.price,
            price_history.recorded_at,
        )

        try:
            cursor.execute(query, values)

            connection.commit()

            price_history.id = cursor.lastrowid

            return price_history

        finally:
            cursor.close()
            connection.close()

    def find_by_coin_id(
        self,
        coin_id: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        limit: int | None = None,
        offset: int = 0,
        sort_by: str = "recorded_at",
        sort_order: str = "asc",
    ) -> list[PriceHistory]:

        sort_column, sort_direction = self._get_sorting_sql(
            sort_by=sort_by,
            sort_order=sort_order,
        )

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                id,
                coin_id,
                price,
                recorded_at
            FROM price_history
            WHERE coin_id = %s
        """

        params = [coin_id]

        if start_date is not None:
            query += " AND recorded_at >= %s"
            params.append(start_date)

        if end_date is not None:
            query += " AND recorded_at <= %s"
            params.append(end_date)

        if min_price is not None:
            query += " AND price >= %s"
            params.append(min_price)

        if max_price is not None:
            query += " AND price <= %s"
            params.append(max_price)

        query += f" ORDER BY {sort_column} {sort_direction}, id ASC"

        if limit is not None:
            query += " LIMIT %s"
            params.append(limit)

            query += " OFFSET %s"
            params.append(offset)

        try:
            cursor.execute(query, params)

            rows = cursor.fetchall()

            return [
                PriceHistory(
                    id=row["id"],
                    coin_id=row["coin_id"],
                    price=row["price"],
                    recorded_at=row["recorded_at"],
                )
                for row in rows
            ]

        finally:
            cursor.close()
            connection.close()

    def get_statistics_by_coin_id(self, coin_id: str) -> dict:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                COUNT(*) AS count,
                MIN(price) AS min_price,
                MAX(price) AS max_price,
                AVG(price) AS average_price
            FROM price_history
            WHERE coin_id = %s
        """

        try:
            cursor.execute(query, (coin_id,))
            return cursor.fetchone()

        finally:
            cursor.close()
            connection.close()
