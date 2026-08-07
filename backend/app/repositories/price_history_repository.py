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
