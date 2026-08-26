from app.database.connection import get_connection


class UserRepository:

    def save(self, user):

        connection = get_connection()
        cursor = None

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

        try:
            cursor = connection.cursor()
            cursor.execute(
                query, (user.username, user.email, user.password_hash, user.created_at)
            )
            connection.commit()
            user.id = cursor.lastrowid
            return user
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def find_all(self):
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT *
            FROM users
            """
            cursor.execute(query)
            return cursor.fetchall()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def find_by_id(self, user_id):

        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT *
            FROM users
            WHERE id = %s
            """
            cursor.execute(query, (user_id,))
            return cursor.fetchone()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def exists(self, user_id):

        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            query = """
            SELECT 1
            FROM users
            WHERE id = %s
            LIMIT 1
            """
            cursor.execute(query, (user_id,))
            return cursor.fetchone() is not None
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def exists_by_email(self, email: str) -> bool:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            query = """
            SELECT 1
            FROM users
            WHERE email = %s
            LIMIT 1
            """
            cursor.execute(query, (email,))
            return cursor.fetchone() is not None
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def find_by_email(self, email: str):
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            return cursor.fetchone()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()
