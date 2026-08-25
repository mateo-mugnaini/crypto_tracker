from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from app.config.settings import settings
from app.observability import get_request_id


class JsonFormatter(logging.Formatter):
    """Serialize application log records without including request payloads."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.fromtimestamp(
                record.created,
                tz=timezone.utc,
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for field in (
            "event",
            "method",
            "path",
            "status_code",
            "duration_ms",
            "error_type",
        ):
            value = getattr(record, field, None)
            if value is not None:
                payload[field] = value

        request_id = getattr(record, "request_id", None) or get_request_id()
        if request_id is not None:
            payload["request_id"] = request_id

        return json.dumps(payload, ensure_ascii=False)


def configure_logging() -> None:
    """Configure one JSON stream handler for application logs per process."""
    logger = logging.getLogger("crypto_tracker")

    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)

    logger.setLevel(settings.log_level)
    logger.propagate = False
