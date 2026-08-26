from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PortfolioHoldingRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid",
    )

    coin_id: str = Field(
        min_length=1,
        max_length=64,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="Identificador de CoinGecko de la moneda",
    )
    quantity: float = Field(
        gt=0,
        description="Cantidad de monedas en cartera",
    )
    average_buy_price: float = Field(
        gt=0,
        description="Precio medio de compra en USD",
    )

    @field_validator("coin_id", mode="before")
    @classmethod
    def normalize_coin_id(cls, value):
        if isinstance(value, str):
            return value.strip().lower()

        return value


class PortfolioHoldingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    coin_id: str
    symbol: str
    name: str
    quantity: float
    average_buy_price: float
    invested_value: float
    current_price: float | None = None
    current_value: float | None = None
    profit_loss: float | None = None
    profit_loss_percentage: float | None = None
    allocation_percentage: float | None = None


class PortfolioResponse(BaseModel):
    total_invested: float
    total_current_value: float | None = None
    total_profit_loss: float | None = None
    total_profit_loss_percentage: float | None = None
    holdings: list[PortfolioHoldingResponse]


class PortfolioActionResponse(BaseModel):
    success: bool
    message: str


class PortfolioOperationRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid",
    )

    coin_id: str = Field(
        min_length=1,
        max_length=64,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    operation_type: Literal["buy", "sell"]
    quantity: float = Field(gt=0)
    price_usd: float = Field(gt=0)
    fee_usd: float = Field(default=0, ge=0)
    executed_at: datetime
    note: str | None = Field(default=None, max_length=500)

    @field_validator("coin_id", mode="before")
    @classmethod
    def normalize_coin_id(cls, value):
        if isinstance(value, str):
            return value.strip().lower()

        return value


class PortfolioOperationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    coin_id: str
    symbol: str
    name: str
    operation_type: Literal["buy", "sell"]
    quantity: float
    price_usd: float
    fee_usd: float
    executed_at: datetime
    note: str | None = None


class PortfolioOperationsResponse(BaseModel):
    data: list[PortfolioOperationResponse]
    total: int


class PortfolioOperationsSummaryResponse(BaseModel):
    total_invested: float
    total_current_value: float | None = None
    realized_profit_loss: float
    unrealized_profit_loss: float | None = None
    total_profit_loss: float | None = None
