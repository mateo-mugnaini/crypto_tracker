from app.database.connection import get_connection


class FavoriteRepository:

    def save(self, favorite):

        connection = get_connection()
        cursor = None
        try:
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
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def find_all_by_user(self, user_id):

        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT *
            FROM favorites
            WHERE user_id = %s
            """
            cursor.execute(query, (user_id,))
            return cursor.fetchall()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def exists(self, user_id, coin_id):

        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            query = """
            SELECT 1
            FROM favorites
            WHERE user_id = %s
            AND coin_id = %s
            LIMIT 1
            """
            cursor.execute(query, (user_id, coin_id))
            return cursor.fetchone() is not None
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def delete(self, user_id, coin_id):

        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            query = """
            DELETE FROM favorites
            WHERE user_id = %s
            AND coin_id = %s
            """
            cursor.execute(query, (user_id, coin_id))
            deleted = cursor.rowcount > 0
            connection.commit()
            return deleted
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def find_all_with_coin_data(self, user_id):

        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT
                f.coin_id,
                c.symbol,
                c.name,
                c.market_cap_rank
            FROM favorites f
            INNER JOIN coins c
                ON f.coin_id = c.id
            WHERE f.user_id = %s
            """
            cursor.execute(query, (user_id,))
            return cursor.fetchall()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()
