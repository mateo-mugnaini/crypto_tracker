from app.database.connection import get_connection

from app.models.coin import Coin


class CoinRepository:

    _COIN_READ_QUERY = """
        SELECT
            c.id,
            c.symbol,
            c.name,
            c.market_cap_rank,
            (
                SELECT ph.price
                FROM price_history AS ph
                WHERE ph.coin_id = c.id
                ORDER BY ph.recorded_at DESC, ph.id DESC
                LIMIT 1
            ) AS current_price
        FROM coins AS c
    """

    def save(self, coin: Coin):

        connection = None
        cursor = None

        try:

            connection = get_connection()

            cursor = connection.cursor()

            query = """
            INSERT INTO coins
            (
                id,
                symbol,
                name,
                market_cap_rank
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s
            )

            ON DUPLICATE KEY UPDATE

                symbol = VALUES(symbol),
                name = VALUES(name),
                market_cap_rank = VALUES(market_cap_rank)
            """

            cursor.execute(
                query, (coin.id, coin.symbol, coin.name, coin.market_cap_rank)
            )

            connection.commit()

        finally:

            if cursor:

                cursor.close()

            if connection:

                connection.close()

    def find_all(self):

        connection = get_connection()

        cursor = connection.cursor(dictionary=True)

        query = f"""
            {self._COIN_READ_QUERY}
            ORDER BY c.market_cap_rank ASC
        """

        cursor.execute(query)

        coins = cursor.fetchall()

        cursor.close()

        connection.close()

        return coins

    def find_by_id(self, coin_id):

        connection = get_connection()

        cursor = connection.cursor(dictionary=True)

        query = f"""
            {self._COIN_READ_QUERY}
            WHERE c.id = %s
        """

        cursor.execute(query, (coin_id,))

        coin = cursor.fetchone()

        cursor.close()
        connection.close()

        return coin

    def exists(self, coin_id):

        connection = get_connection()

        cursor = connection.cursor()

        query = """
        SELECT 1
        FROM coins
        WHERE id = %s
        LIMIT 1
        """

        cursor.execute(query, (coin_id,))

        result = cursor.fetchone()

        cursor.close()
        connection.close()

        return result is not None

    def update(self, coin):

        connection = get_connection()

        cursor = connection.cursor()

        query = """
        UPDATE coins
        SET
            symbol = %s,
            name = %s,
            market_cap_rank = %s
        WHERE id = %s
        """

        cursor.execute(query, (coin.symbol, coin.name, coin.market_cap_rank, coin.id))

        connection.commit()

        cursor.close()

        connection.close()
