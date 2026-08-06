from dataclasses import dataclass


@dataclass
class Coin:
    id: str
    symbol: str
    name: str
    market_cap_rank: int | None = None
