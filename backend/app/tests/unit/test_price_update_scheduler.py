import asyncio

import pytest

from app.schedulers.price_update_scheduler import PriceUpdateScheduler


pytestmark = pytest.mark.unit


class FakeCoinRepository:
    def find_all(self):
        return [{"id": "bitcoin"}, {"id": "ethereum"}]


class FakePriceHistoryService:
    def __init__(self):
        self.updated_coin_ids = []

    def update_current_price(self, coin_id):
        self.updated_coin_ids.append(coin_id)


def test_update_once_updates_all_local_coins():
    service = FakePriceHistoryService()
    scheduler = PriceUpdateScheduler(
        coin_repository=FakeCoinRepository(),
        price_history_service=service,
        interval_seconds=300,
    )

    result = asyncio.run(scheduler.update_once())

    assert result == {"total": 2, "updated": 2, "failed": 0}
    assert service.updated_coin_ids == ["bitcoin", "ethereum"]


def test_run_can_be_cancelled_cleanly():
    service = FakePriceHistoryService()
    scheduler = PriceUpdateScheduler(
        coin_repository=FakeCoinRepository(),
        price_history_service=service,
        interval_seconds=300,
    )

    async def scenario():
        task = asyncio.create_task(scheduler.run())
        await asyncio.sleep(0)
        task.cancel()

        with pytest.raises(asyncio.CancelledError):
            await task

    asyncio.run(scenario())
