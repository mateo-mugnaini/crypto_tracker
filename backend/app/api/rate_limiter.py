from collections import deque
from math import ceil
from threading import Lock
from time import monotonic


class InMemoryRateLimiter:
    """Sliding-window limiter intended for one application process."""

    def __init__(self, max_requests: int, window_seconds: int, max_keys: int = 10_000):
        if max_requests <= 0:
            raise ValueError("max_requests must be greater than 0")

        if window_seconds <= 0:
            raise ValueError("window_seconds must be greater than 0")

        if max_keys <= 0:
            raise ValueError("max_keys must be greater than 0")

        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_keys = max_keys
        self._requests: dict[str, deque[float]] = {}
        self._lock = Lock()

    def allow(self, key: str) -> tuple[bool, int, int]:
        now = monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            self._remove_expired(cutoff)
            if key not in self._requests and len(self._requests) >= self.max_keys:
                self._requests.pop(next(iter(self._requests)))
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

    def _remove_expired(self, cutoff: float) -> None:
        for key, timestamps in list(self._requests.items()):
            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()
            if not timestamps:
                del self._requests[key]

    def reset(self) -> None:
        with self._lock:
            self._requests.clear()


class InMemoryConnectionLimiter:
    """Bounded per-key connection counter for one application process."""

    def __init__(self, max_connections: int, max_keys: int = 10_000):
        if max_connections <= 0:
            raise ValueError("max_connections must be greater than 0")
        if max_keys <= 0:
            raise ValueError("max_keys must be greater than 0")
        self.max_connections = max_connections
        self.max_keys = max_keys
        self._connections: dict[str, int] = {}
        self._lock = Lock()

    def acquire(self, key: str) -> bool:
        with self._lock:
            current = self._connections.get(key, 0)
            if current >= self.max_connections:
                return False
            if key not in self._connections and len(self._connections) >= self.max_keys:
                return False
            self._connections[key] = current + 1
            return True

    def release(self, key: str) -> None:
        with self._lock:
            current = self._connections.get(key, 0)
            if current <= 1:
                self._connections.pop(key, None)
            else:
                self._connections[key] = current - 1

    def reset(self) -> None:
        with self._lock:
            self._connections.clear()
