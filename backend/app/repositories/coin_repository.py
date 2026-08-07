from app.database.connection import get_connection

from app.models.coin import Coin


class CoinRepository:

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

        query = """
        SELECT *
        FROM coins
        """

        cursor.execute(query)

        coins = cursor.fetchall()

        cursor.close()

        connection.close()

        return coins

    def find_by_id(self, coin_id):

        connection = get_connection()

        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT *
        FROM coins
        WHERE id = %s
        """

        cursor.execute(query, (coin_id,))

        coin = cursor.fetchone()

        cursor.close()
        connection.close()

        return coin
