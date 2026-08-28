import pytest

from app.api.rate_limiter import InMemoryConnectionLimiter, InMemoryRateLimiter


pytestmark = pytest.mark.unit


def test_rate_limiter_allows_requests_until_limit():
    limiter = InMemoryRateLimiter(max_requests=2, window_seconds=60)

    assert limiter.allow("client")[0:3] == (True, 0, 1)
    assert limiter.allow("client")[0:3] == (True, 0, 0)

    allowed, retry_after, remaining = limiter.allow("client")

    assert allowed is False
    assert retry_after >= 1
    assert remaining == 0


def test_rate_limiter_keeps_clients_isolated_and_can_reset():
    limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60)

    assert limiter.allow("client-a")[0] is True
    assert limiter.allow("client-b")[0] is True
    assert limiter.allow("client-a")[0] is False

    limiter.reset()

    assert limiter.allow("client-a")[0] is True


def test_rate_limiter_does_not_grow_without_bound():
    limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60, max_keys=2)

    assert limiter.allow("client-a")[0] is True
    assert limiter.allow("client-b")[0] is True
    assert limiter.allow("client-c")[0] is True
    assert len(limiter._requests) == 2


def test_connection_limiter_releases_and_limits_each_key():
    limiter = InMemoryConnectionLimiter(max_connections=1)

    assert limiter.acquire("user:1") is True
    assert limiter.acquire("user:1") is False
    assert limiter.acquire("user:2") is True
    limiter.release("user:1")
    assert limiter.acquire("user:1") is True
