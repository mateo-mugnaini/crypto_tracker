import mysql.connector

from app.config.settings import Settings


def get_connection():

    connection = mysql.connector.connect(
        host=Settings.mysql_host,
        port=Settings.mysql_port,
        user=Settings.mysql_user,
        password=Settings.mysql_password,
        database=Settings.mysql_database,
    )
    return connection
