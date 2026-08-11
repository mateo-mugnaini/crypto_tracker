from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


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


class PriceHistoryDateRangeQueryParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    start_date: date | None = Field(
        default=None,
        description="Fecha inicial del filtro",
    )
    end_date: date | None = Field(
        default=None,
        description="Fecha final del filtro",
    )

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.start_date is not None and self.end_date is not None:
            if self.start_date > self.end_date:
                raise ValueError("start_date cannot be greater than end_date")

        return self


class PriceHistoryQueryParams(PriceHistoryDateRangeQueryParams):
    min_price: float | None = Field(
        default=None,
        ge=0,
        description="Precio minimo permitido",
    )
    max_price: float | None = Field(
        default=None,
        ge=0,
        description="Precio maximo permitido",
    )
    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Cantidad maxima de registros",
    )
    offset: int = Field(
        default=0,
        ge=0,
        description="Cantidad de registros a omitir",
    )
    sort_by: Literal["recorded_at", "price"] = Field(
        default="recorded_at",
        description="Campo de ordenamiento permitido",
    )
    sort_order: Literal["asc", "desc"] = Field(
        default="asc",
        description="Direccion de ordenamiento permitida",
    )

    @field_validator("sort_by", "sort_order", mode="before")
    @classmethod
    def normalize_sorting_values(cls, value):
        if isinstance(value, str):
            return value.strip().lower()

        return value

    @model_validator(mode="after")
    def validate_price_range(self):
        if self.min_price is not None and self.max_price is not None:
            if self.min_price > self.max_price:
                raise ValueError("min_price cannot be greater than max_price")

        return self


class PriceHistoryAggregationQueryParams(PriceHistoryDateRangeQueryParams):
    period: Literal["hour", "day", "week"] = Field(
        default="day",
        description="Periodo de agregacion",
    )

    @field_validator("period", mode="before")
    @classmethod
    def normalize_period(cls, value):
        if isinstance(value, str):
            return value.strip().lower()

        return value
