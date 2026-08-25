import pytest

from app.observability import RequestMetrics


pytestmark = pytest.mark.unit


def test_request_metrics_snapshot_is_thread_safe_and_aggregated():
    metrics = RequestMetrics()
    metrics.record(200, 1.25)
    metrics.record(404, 2.75)
    metrics.record(500, 3.0)

    assert metrics.snapshot() == {
        "total_requests": 3,
        "error_responses": 2,
        "total_duration_ms": 7.0,
        "status_counts": {"200": 1, "404": 1, "500": 1},
    }

    metrics.reset()
    assert metrics.snapshot()["total_requests"] == 0
