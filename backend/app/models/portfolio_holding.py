from datetime import datetime


class PortfolioHolding:
    """A non-custodial user position for a locally known coin."""

    def __init__(
        self,
        user_id: int,
        coin_id: str,
        quantity: float,
        average_buy_price: float,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ):
        self.user_id = user_id
        self.coin_id = coin_id
        self.quantity = quantity
        self.average_buy_price = average_buy_price
        self.created_at = created_at
        self.updated_at = updated_at
