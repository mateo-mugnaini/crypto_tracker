from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PortfolioAnalyticsPoint(BaseModel):
    timestamp: datetime
    value: float
    invested: float


class PortfolioAnalyticsAsset(BaseModel):
    coin_id: str
    symbol: str
    name: str
    quantity: float
    invested: float
    current_price: float | None = None
    current_value: float | None = None
    profit_loss: float | None = None
    profit_loss_percentage: float | None = None
    allocation_percentage: float | None = None


class PortfolioBenchmarkPoint(BaseModel):
    timestamp: datetime
    percentage_change: float


class PortfolioAnalyticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    period_days: int
    period_start: datetime
    period_end: datetime
    points: list[PortfolioAnalyticsPoint]
    assets: list[PortfolioAnalyticsAsset]
    total_return_percentage: float | None = None
    max_drawdown_percentage: float | None = None
    volatility_percentage: float | None = None
    benchmark_coin_id: str | None = None
    benchmark: list[PortfolioBenchmarkPoint]
