from threading import Lock

import mysql.connector
from mysql.connector import pooling

from app.config.settings import settings


_connection_pool = None
_connection_pool_lock = Lock()


def _create_connection_pool():
    return pooling.MySQLConnectionPool(
        pool_name="crypto_tracker_app",
        pool_size=settings.mysql_pool_size,
        pool_reset_session=True,
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        database=settings.mysql_database,
    )


def get_connection():
    """Get a pooled application connection, creating the pool lazily."""
    global _connection_pool

    if _connection_pool is None:
        with _connection_pool_lock:
            if _connection_pool is None:
                _connection_pool = _create_connection_pool()

    return _connection_pool.get_connection()


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
