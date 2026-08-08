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

    def find_all_by_user(self, user_id):

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT *
        FROM favorites
        WHERE user_id = %s
        """

        cursor.execute(query, (user_id,))

        favorites = cursor.fetchall()

        cursor.close()
        connection.close()

        return favorites

    def exists(self, user_id, coin_id):

        connection = get_connection()
        cursor = connection.cursor()

        query = """
        SELECT 1
        FROM favorites
        WHERE user_id = %s
        AND coin_id = %s
        LIMIT 1
        """

        cursor.execute(query, (user_id, coin_id))

        result = cursor.fetchone()

        cursor.close()
        connection.close()

        return result is not None

    def delete(self, user_id, coin_id):

        connection = get_connection()
        cursor = connection.cursor()

        query = """
        DELETE FROM favorites
        WHERE user_id = %s
        AND coin_id = %s
        """

        cursor.execute(query, (user_id, coin_id))

        deleted = cursor.rowcount > 0

        connection.commit()

        cursor.close()
        connection.close()

        return deleted
