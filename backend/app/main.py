import logging

from app.container import Container
from app.logging_config import configure_logging


logger = logging.getLogger("crypto_tracker.cli")


def main():
    configure_logging()
    container = Container()

    result = container.coin_controller.update_coin("bitcoin")

    logger.info(
        "Coin synchronization completed.",
        extra={
            "event": "coin_sync_completed",
            "path": "bitcoin",
        },
    )


if __name__ == "__main__":
    main()
