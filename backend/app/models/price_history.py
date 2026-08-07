class PriceHistory:

    def __init__(self, id, coin_id, price, recorded_at):
        self.id = id
        self.coin_id = coin_id
        self.price = price
        self.recorded_at = recorded_at

    def __str__(self):
        return f"{self.coin_id}: {self.price}"
