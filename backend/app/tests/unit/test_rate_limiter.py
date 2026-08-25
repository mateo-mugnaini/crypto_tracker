import pytest

from app.api.rate_limiter import InMemoryRateLimiter


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
