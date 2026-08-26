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

AGGREGATION_PERIODS = {
    "hour": "DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00')",
    "day": "DATE(recorded_at)",
    "week": (
        "DATE_SUB(DATE(recorded_at), "
        "INTERVAL WEEKDAY(recorded_at) DAY)"
    ),
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

    @staticmethod
    def _get_aggregation_period_sql(period: str) -> str:
        expression = AGGREGATION_PERIODS.get(period)

        if expression is None:
            raise ValueError("period must be one of: hour, day, week")

        return expression

    def save(self, price_history: PriceHistory) -> PriceHistory:
        connection = get_connection()
        cursor = None

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
            cursor = connection.cursor()
            cursor.execute(query, values)

            connection.commit()

            price_history.id = cursor.lastrowid

            return price_history

        finally:
            if cursor is not None:
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
        cursor = None

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
            cursor = connection.cursor(dictionary=True)
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
            if cursor is not None:
                cursor.close()
            connection.close()

    def get_statistics_by_coin_id(self, coin_id: str) -> dict:
        connection = get_connection()
        cursor = None

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
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, (coin_id,))
            return cursor.fetchone()

        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def get_initial_and_final_prices(
        self,
        coin_id: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> dict:
        connection = get_connection()
        cursor = None

        conditions = ["coin_id = %s"]
        params = [coin_id]

        if start_date is not None:
            conditions.append("recorded_at >= %s")
            params.append(start_date)

        if end_date is not None:
            conditions.append("recorded_at <= %s")
            params.append(end_date)

        where_clause = " AND ".join(conditions)

        initial_query = f"""
            SELECT price, recorded_at
            FROM price_history
            WHERE {where_clause}
            ORDER BY recorded_at ASC, id ASC
            LIMIT 1
        """

        final_query = f"""
            SELECT price, recorded_at
            FROM price_history
            WHERE {where_clause}
            ORDER BY recorded_at DESC, id DESC
            LIMIT 1
        """

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(initial_query, tuple(params))
            initial_row = cursor.fetchone()

            cursor.execute(final_query, tuple(params))
            final_row = cursor.fetchone()

            return {
                "initial_price": (
                    initial_row["price"] if initial_row is not None else None
                ),
                "final_price": (
                    final_row["price"] if final_row is not None else None
                ),
            }

        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def get_price_aggregations(
        self,
        coin_id: str,
        period: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[dict]:
        period_expression = self._get_aggregation_period_sql(period)

        connection = get_connection()
        cursor = None

        conditions = ["coin_id = %s"]
        params = [coin_id]

        if start_date is not None:
            conditions.append("recorded_at >= %s")
            params.append(start_date)

        if end_date is not None:
            conditions.append("recorded_at <= %s")
            params.append(end_date)

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT
                {period_expression} AS period,
                AVG(price) AS average_price,
                MIN(price) AS min_price,
                MAX(price) AS max_price,
                COUNT(*) AS count
            FROM price_history
            WHERE {where_clause}
            GROUP BY {period_expression}
            ORDER BY {period_expression} ASC
        """

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, tuple(params))
            return cursor.fetchall()

        finally:
            if cursor is not None:
                cursor.close()
            connection.close()
