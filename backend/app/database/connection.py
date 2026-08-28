from threading import Lock
from time import monotonic, sleep

import mysql.connector
from mysql.connector.errors import PoolError
from mysql.connector import pooling

from app.config.settings import settings


_connection_pool = None
_connection_pool_lock = Lock()


def _create_connection_pool():
    connection_config = {
        "pool_name": "crypto_tracker_app",
        "pool_size": settings.mysql_pool_size,
        "pool_reset_session": True,
        "host": settings.mysql_host,
        "port": settings.mysql_port,
        "user": settings.mysql_user,
        "password": settings.mysql_password,
        "database": settings.mysql_database,
    }
    if settings.mysql_ssl_ca:
        connection_config.update(
            ssl_ca=settings.mysql_ssl_ca,
            ssl_verify_cert=True,
            ssl_verify_identity=True,
        )
    return pooling.MySQLConnectionPool(**connection_config)


def get_connection():
    """Get a pooled application connection, creating the pool lazily."""
    global _connection_pool

    if _connection_pool is None:
        with _connection_pool_lock:
            if _connection_pool is None:
                _connection_pool = _create_connection_pool()

    deadline = monotonic() + settings.mysql_pool_acquire_timeout_seconds
    while True:
        try:
            return _connection_pool.get_connection()
        except PoolError:
            if monotonic() >= deadline:
                raise
            sleep(0.05)


def get_test_connection():
    if not settings.mysql_test_database:
        raise RuntimeError("MYSQL_TEST_DATABASE no está configurada.")

    connection_config = {
        "host": settings.mysql_host,
        "port": settings.mysql_port,
        "user": settings.mysql_user,
        "password": settings.mysql_password,
        "database": settings.mysql_test_database,
    }
    if settings.mysql_ssl_ca:
        connection_config.update(
            ssl_ca=settings.mysql_ssl_ca,
            ssl_verify_cert=True,
            ssl_verify_identity=True,
        )
    return mysql.connector.connect(**connection_config)
