from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PriceAlertRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    coin_id: str = Field(min_length=1, max_length=64, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    condition: Literal["above", "below"]
    target_price: float = Field(gt=0)

    @field_validator("coin_id", mode="before")
    @classmethod
    def normalize_coin_id(cls, value):
        return value.strip().lower() if isinstance(value, str) else value


class PriceAlertUpdateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    condition: Literal["above", "below"] | None = None
    target_price: float | None = Field(default=None, gt=0)
    is_active: bool | None = None


class PriceAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    coin_id: str
    symbol: str
    name: str
    condition: Literal["above", "below"]
    target_price: float
    is_active: bool
    current_price: float | None = None
    last_triggered_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class PriceAlertListResponse(BaseModel):
    data: list[PriceAlertResponse]
    total: int


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    alert_id: int | None = None
    coin_id: str | None = None
    symbol: str | None = None
    name: str | None = None
    title: str
    message: str
    current_price: float | None = None
    is_read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    data: list[NotificationResponse]
    total: int
    unread: int
