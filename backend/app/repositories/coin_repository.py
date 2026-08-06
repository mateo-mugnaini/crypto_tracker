from app.database.connection import get_connection

from app.models.coin import Coin


class CoinRepository:

    def save(self, coin: Coin):

        connection = None

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

            if connection:

                connection.close()
