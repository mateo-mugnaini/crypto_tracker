from datetime import datetime


class PriceAlert:
    """Regla de precio perteneciente a un usuario."""

    def __init__(self, user_id: int, coin_id: str, condition: str, target_price: float):
        self.id = None
        self.user_id = user_id
        self.coin_id = coin_id
        self.condition = condition
        self.target_price = target_price
        self.is_active = True
        self.created_at: datetime | None = None
        self.updated_at: datetime | None = None
