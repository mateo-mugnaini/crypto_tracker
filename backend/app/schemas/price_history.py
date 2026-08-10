from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class PriceHistoryResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
    )

    id: int | None
    coin_id: str
    price: float
    recorded_at: datetime


class PriceHistoryStatisticsResponse(BaseModel):
    coin_id: str
    count: int
    min_price: float | None
    max_price: float | None
    average_price: float | None


class PriceHistoryVariationResponse(BaseModel):
    coin_id: str
    initial_price: float | None
    final_price: float | None
    absolute_change: float | None
    percentage_change: float | None
    trend: Literal["up", "down", "unchanged"] | None


class PriceHistoryAggregationResponse(BaseModel):
    period: str
    average_price: float | None
    min_price: float | None
    max_price: float | None
    count: int
