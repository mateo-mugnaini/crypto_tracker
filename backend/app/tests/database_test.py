from app.database.connection import get_connection


def main():
    connection = None
    try:
        connection = get_connection()
        print("==========================")
        print("Conexión exitosa con MySQL")
        print("==========================")

    except Exception as error:
        print("==========================")
        print("ERROR", error)
        print("==========================")

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    main()


