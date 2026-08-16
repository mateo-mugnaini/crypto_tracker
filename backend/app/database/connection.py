import mysql.connector

from app.config.settings import settings


def get_connection():

    connection = mysql.connector.connect(
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        database=settings.mysql_database,
    )
    return connection


def get_test_connection():
    if not settings.mysql_test_database:
        raise RuntimeError("MYSQL_TEST_DATABASE no está configurada.")

    return mysql.connector.connect(
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        database=settings.mysql_test_database,
    )
