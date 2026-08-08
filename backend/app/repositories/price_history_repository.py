from app.database.connection import get_connection


class PriceHistoryRepository:

    def save(self, history):

        connection = get_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO price_history
        (
            coin_id,
            price,
            recorded_at
        )
        VALUES
        (
            %s,
            %s,
            %s
        )
        """

        cursor.execute(query, (history.coin_id, history.price, history.recorded_at))

        connection.commit()

        cursor.close()
        connection.close()

    def find_by_coin(self, coin_id):

        connection = get_connection()

        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT *
        FROM price_history
        WHERE coin_id = %s
        ORDER BY recorded_at DESC
        """

        cursor.execute(query, (coin_id,))

        history = cursor.fetchall()

        cursor.close()

        connection.close()

        return history
