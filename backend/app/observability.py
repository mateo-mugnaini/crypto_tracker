from __future__ import annotations

from contextvars import ContextVar
from threading import Lock


_request_id: ContextVar[str | None] = ContextVar(
    "request_id",
    default=None,
)


def set_request_id(value: str):
    return _request_id.set(value)


def reset_request_id(token) -> None:
    _request_id.reset(token)


def get_request_id() -> str | None:
    return _request_id.get()


class RequestMetrics:
    """Small process-local counters for basic request observability."""

    def __init__(self):
        self._lock = Lock()
        self._total_requests = 0
        self._error_responses = 0
        self._total_duration_ms = 0.0
        self._status_counts: dict[str, int] = {}

    def record(self, status_code: int, duration_ms: float) -> None:
        with self._lock:
            self._total_requests += 1
            if status_code >= 400:
                self._error_responses += 1
            self._total_duration_ms += duration_ms
            status_key = str(status_code)
            self._status_counts[status_key] = (
                self._status_counts.get(status_key, 0) + 1
            )

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "total_requests": self._total_requests,
                "error_responses": self._error_responses,
                "total_duration_ms": round(self._total_duration_ms, 2),
                "status_counts": dict(self._status_counts),
            }

    def reset(self) -> None:
        with self._lock:
            self._total_requests = 0
            self._error_responses = 0
            self._total_duration_ms = 0.0
            self._status_counts.clear()
