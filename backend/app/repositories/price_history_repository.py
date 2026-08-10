from datetime import datetime

from app.models.price_history import PriceHistory
from app.database.connection import get_connection


class PriceHistoryRepository:

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
    ) -> list[PriceHistory]:

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

        query += """
            ORDER BY recorded_at ASC, id ASC
        """

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
