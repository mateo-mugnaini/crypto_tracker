from pydantic import BaseModel, ConfigDict, Field


class FavoriteCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    user_id: int = Field(
        gt=0,
        description="Identificador positivo del usuario",
    )
    coin_id: str = Field(
        min_length=1,
        description="Identificador de CoinGecko de la moneda",
    )


class FavoriteActionResponse(BaseModel):
    success: bool
    message: str
