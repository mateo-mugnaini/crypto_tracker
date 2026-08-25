from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok", "ready", "not_ready"]
    service: str | None = None
    checks: dict[str, str] = Field(default_factory=dict)
