from datetime import datetime

from app.models.price_history import PriceHistory
from app.database.connection import get_connection


class PriceHistoryRepository:

    def save(self, price_history: PriceHistory) -> PriceHistory:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO price_history(}
                coin_id, 
                price,
                recorded_at
            )
            VALUES (%s,%s,%s)
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

    def get_by_coin_id(
        self,
        coin_id: str,
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
            ORDER BY recorded_at ASC
        """

        try:
            cursor.execute(query, (coin_id,))

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

    def get_by_coin_id_and_date_range(
        self,
        coin_id: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
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

        parameters = [coin_id]

        if start_date is not None:
            query += """
                AND recorded_at >= %s
            """
            parameters.append(start_date)

        if end_date is not None:
            query += """
                AND recorded_at >= %s
            """
            parameters.append(end_date)
        query += """
            ORDER BY recorded_at ASC
        """

        try:
            cursor.execute(query, tuple(parameters))

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
