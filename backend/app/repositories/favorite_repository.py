from app.database.connection import get_connection


class FavoriteRepository:

    def save(self, favorite):

        connection = get_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO favorites
        (
            user_id,
            coin_id
        )
        VALUES
        (
            %s,
            %s
        )
        """

        cursor.execute(query, (favorite.user_id, favorite.coin_id))

        connection.commit()

        cursor.close()
        connection.close()
