# from app.database.connection import get_connection


# class UserRepository:

#     def save(self, user):
#         connection = get_connection()
#         cursor = connection.cursor()

#         query = """
#         INSERT INTO users
#         (
#             username,
#             email,
#             password_hash,
#             created_at
#         )
#         VALUES
#         (
#             $s,
#             $s,
#             $s,
#             $s,
#         )
#         """

#         cursor.execute(
#             query, (user.username, user.email, user.password_hash, user.created_at)
#         )

#         connection.commit()

#         cursor.close()
#         connection.close()

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
