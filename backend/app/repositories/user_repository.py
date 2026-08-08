from app.database.connection import get_connection


class UserRepository:

    def save(self, user):

        connection = get_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO users
        (
            username,
            email,
            password_hash,
            created_at
        )
        VALUES
        (
            %s,
            %s,
            %s,
            %s
        )
        """

        cursor.execute(
            query, (user.username, user.email, user.password_hash, user.created_at)
        )

        connection.commit()

        cursor.close()
        connection.close()

    def find_all(self):
        connection = get_connection()

        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT *
        FROM users
        """

        cursor.execute(query)

        users = cursor.fetchall()

        cursor.close()
        connection.close()

        return users

    def find_by_id(self, user_id):

        connection = get_connection()

        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT *
        FROM users
        WHERE id = %s
        """

        cursor.execute(query, (user_id,))

        user = cursor.fetchone()

        cursor.close()
        connection.close()

        return user

    def exists(self, user_id):

        connection = get_connection()

        cursor = connection.cursor()

        query = """
        SELECT 1 
        FROM users 
        WHERE id = %s 
        LIMIT 1
        """

        cursor.execute(query, (user_id,))

        result = cursor.fetchone()

        cursor.close()

        connection.close()

        return result is not None
