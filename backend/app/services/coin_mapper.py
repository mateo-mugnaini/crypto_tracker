from app.models.coin import Coin


class CoinMapper:
    @staticmethod
    def to_coin(data: dict) -> Coin:
        return Coin(
            id=data["id"],
            symbol=data["symbol"],
            name=data["name"],
            market_cap_rank=data.get("market_cap_rank"),
        )


def map_coin(data: dict) -> Coin:
    return CoinMapper.to_coin(data)
