from collections import deque
from math import ceil
from threading import Lock
from time import monotonic


class InMemoryRateLimiter:
    """Sliding-window limiter intended for one application process."""

    def __init__(self, max_requests: int, window_seconds: int):
        if max_requests <= 0:
            raise ValueError("max_requests must be greater than 0")

        if window_seconds <= 0:
            raise ValueError("window_seconds must be greater than 0")

        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, deque[float]] = {}
        self._lock = Lock()

    def allow(self, key: str) -> tuple[bool, int, int]:
        now = monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            timestamps = self._requests.setdefault(key, deque())

            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()

            if len(timestamps) >= self.max_requests:
                retry_after = max(
                    1,
                    ceil(self.window_seconds - (now - timestamps[0])),
                )
                return False, retry_after, 0

            timestamps.append(now)
            remaining = self.max_requests - len(timestamps)

            return True, 0, remaining

    def reset(self) -> None:
        with self._lock:
            self._requests.clear()
