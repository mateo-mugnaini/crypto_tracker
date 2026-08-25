import logging

from app.database.connection import get_connection


logger = logging.getLogger("crypto_tracker.health")


def check_database() -> bool:
    """Check database connectivity without exposing driver details to HTTP."""
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        return True
    except Exception as error:
        logger.warning(
            "Database readiness check failed.",
            extra={
                "event": "database_readiness_failed",
                "error_type": type(error).__name__,
            },
        )
        return False
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()
