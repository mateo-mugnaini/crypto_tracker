import asyncio
import logging
from time import perf_counter


logger = logging.getLogger("crypto_tracker.scheduler")


class PriceUpdateScheduler:
    """Periodically persist current prices for locally known coins."""

    def __init__(self, coin_repository, price_history_service, interval_seconds: int):
        self.coin_repository = coin_repository
        self.price_history_service = price_history_service
        self.interval_seconds = interval_seconds

    async def run(self) -> None:
        logger.info(
            "Price update scheduler started.",
            extra={
                "event": "price_update_scheduler_started",
                "interval_seconds": self.interval_seconds,
            },
        )

        try:
            while True:
                await self.update_once()
                await asyncio.sleep(self.interval_seconds)
        except asyncio.CancelledError:
            logger.info(
                "Price update scheduler stopped.",
                extra={"event": "price_update_scheduler_stopped"},
            )
            raise

    async def update_once(self) -> dict[str, int]:
        started_at = perf_counter()
        coins = await asyncio.to_thread(self.coin_repository.find_all)
        updated = 0
        failed = 0

        for coin in coins:
            coin_id = coin.get("id") if isinstance(coin, dict) else getattr(coin, "id", None)

            if not coin_id:
                failed += 1
                logger.warning(
                    "Skipping a local coin without an identifier.",
                    extra={"event": "price_update_coin_skipped"},
                )
                continue

            try:
                await asyncio.to_thread(
                    self.price_history_service.update_current_price,
                    coin_id,
                )
                updated += 1
            except Exception as error:
                failed += 1
                logger.warning(
                    "Price update failed for a coin.",
                    extra={
                        "event": "price_update_failed",
                        "coin_id": coin_id,
                        "error_type": type(error).__name__,
                    },
                )

        duration_ms = round((perf_counter() - started_at) * 1000, 2)
        result = {"total": len(coins), "updated": updated, "failed": failed}
        logger.info(
            "Price update cycle completed.",
            extra={
                "event": "price_update_cycle_completed",
                "duration_ms": duration_ms,
                **result,
            },
        )
        return result
