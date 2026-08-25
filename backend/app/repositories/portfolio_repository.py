from app.database.connection import get_connection


class PortfolioRepository:
    def save_or_update(self, holding):
        connection = get_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO portfolio_holdings
        (
            user_id,
            coin_id,
            quantity,
            average_buy_price,
            created_at,
            updated_at
        )
        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
            quantity = VALUES(quantity),
            average_buy_price = VALUES(average_buy_price),
            updated_at = CURRENT_TIMESTAMP
        """

        cursor.execute(
            query,
            (
                holding.user_id,
                holding.coin_id,
                holding.quantity,
                holding.average_buy_price,
            ),
        )
        connection.commit()
        cursor.close()
        connection.close()

    def delete(self, user_id: int, coin_id: str) -> bool:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
        DELETE FROM portfolio_holdings
        WHERE user_id = %s
        AND coin_id = %s
        """

        cursor.execute(query, (user_id, coin_id))
        deleted = cursor.rowcount > 0
        connection.commit()
        cursor.close()
        connection.close()
        return deleted

    def exists(self, user_id: int, coin_id: str) -> bool:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
        SELECT 1
        FROM portfolio_holdings
        WHERE user_id = %s
        AND coin_id = %s
        LIMIT 1
        """

        cursor.execute(query, (user_id, coin_id))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return result is not None

    def find_all_by_user(self, user_id: int) -> list[dict]:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT
            ph.user_id,
            ph.coin_id,
            c.symbol,
            c.name,
            ph.quantity,
            ph.average_buy_price,
            (
                SELECT price
                FROM price_history
                WHERE price_history.coin_id = ph.coin_id
                ORDER BY recorded_at DESC, id DESC
                LIMIT 1
            ) AS current_price
        FROM portfolio_holdings ph
        INNER JOIN coins c
            ON c.id = ph.coin_id
        WHERE ph.user_id = %s
        ORDER BY ph.updated_at DESC, ph.coin_id ASC
        """

        cursor.execute(query, (user_id,))
        holdings = cursor.fetchall()
        cursor.close()
        connection.close()
        return holdings
