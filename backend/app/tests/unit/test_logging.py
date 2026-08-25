import json
import logging
from unittest.mock import patch

import pytest
import requests

from app.api.coingecko_client import CoinGeckoClient
from app.logging_config import JsonFormatter


pytestmark = pytest.mark.unit


def test_json_formatter_serializes_allowed_context_fields():
    record = logging.LogRecord(
        name="crypto_tracker.api",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="HTTP request completed.",
        args=(),
        exc_info=None,
    )
    record.event = "http_request_completed"
    record.method = "GET"
    record.path = "/"
    record.status_code = 200
    record.duration_ms = 1.25
    record.token = "must-not-be-logged"

    payload = json.loads(JsonFormatter().format(record))

    assert payload["event"] == "http_request_completed"
    assert payload["method"] == "GET"
    assert payload["path"] == "/"
    assert payload["status_code"] == 200
    assert payload["duration_ms"] == 1.25
    assert "token" not in payload


@patch("app.api.coingecko_client.requests.get")
def test_coingecko_timeout_emits_structured_event(mock_get, caplog):
    mock_get.side_effect = requests.exceptions.Timeout
    client = CoinGeckoClient(base_url="https://example.test", timeout=3)

    with caplog.at_level(logging.WARNING, logger="crypto_tracker.coingecko"):
        assert client.get_coin("bitcoin") == {}

    records = [
        record
        for record in caplog.records
        if record.name == "crypto_tracker.coingecko"
    ]

    assert records[-1].event == "coingecko_timeout"
    assert records[-1].path == "/coins/bitcoin"
    assert records[-1].error_type == "Timeout"
