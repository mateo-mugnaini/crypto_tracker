from pydantic import BaseModel, ConfigDict, Field, field_validator


class FavoriteCreateRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid",
    )

    user_id: int = Field(
        gt=0,
        description="Identificador positivo del usuario",
    )
    coin_id: str = Field(
        min_length=1,
        max_length=64,
        description="Identificador de CoinGecko de la moneda",
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )

    @field_validator("coin_id", mode="before")
    @classmethod
    def normalize_coin_id(cls, value):
        if isinstance(value, str):
            return value.strip().lower()

        return value


class FavoriteActionResponse(BaseModel):
    success: bool
    message: str
