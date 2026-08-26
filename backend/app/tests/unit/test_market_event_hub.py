import asyncio

import pytest

from app.realtime.market_event_hub import MarketEventHub


pytestmark = pytest.mark.unit


def test_hub_fans_out_events_to_subscribers():
    async def scenario():
        hub = MarketEventHub()
        first = hub.subscribe()
        second = hub.subscribe()
        event = {"type": "price_snapshot", "data": {"coin_id": "bitcoin"}}

        await hub.publish(event)

        assert await first.get() == event
        assert await second.get() == event

    asyncio.run(scenario())


def test_hub_drops_oldest_event_when_subscriber_queue_is_full():
    async def scenario():
        hub = MarketEventHub(max_queue_size=1)
        queue = hub.subscribe()
        await hub.publish({"id": 1})
        await hub.publish({"id": 2})
        assert await queue.get() == {"id": 2}

    asyncio.run(scenario())
