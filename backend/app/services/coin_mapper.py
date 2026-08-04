from models.coin import Coin


def map_coin(data: dict) -> Coin:

    return Coin(
        id=data["id"],
        name=data["name"],
        symbol=data["symbol"],
        price=data["current_price"],
        market_cap_rank=data["market_cap_rank"],
    )
