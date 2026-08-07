
class Coin:

    def __init__(self, id, symbol, name, market_cap_rank):
        self.id = id
        self.symbol = symbol
        self.name = name
        self.market_cap_rank = market_cap_rank

    def __str__(self):
        return f"{self.name} ({self.symbol})"
