from pydantic import BaseModel, ConfigDict


class CoinResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    symbol: str
    name: str
    market_cap_rank: int | None = None


class CoinResponseEnvelope(BaseModel):
    success: bool
    message: str
    data: CoinResponse


class CoinListResponseEnvelope(BaseModel):
    success: bool
    message: str
    data: list[CoinResponse]
