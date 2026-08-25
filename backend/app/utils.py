import logging


logger = logging.getLogger("crypto_tracker.cli")


def mostrar_titulo():
    logger.info(
        "Crypto Tracker started.",
        extra={"event": "application_started"},
    )
