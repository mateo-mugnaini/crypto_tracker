from datetime import datetime


class PortfolioOperation:
    """A non-custodial buy or sell declared by a user."""

    def __init__(
        self,
        user_id: int,
        coin_id: str,
        operation_type: str,
        quantity: float,
        price_usd: float,
        fee_usd: float = 0,
        executed_at: datetime | None = None,
        note: str | None = None,
        operation_id: int | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ):
        self.id = operation_id
        self.user_id = user_id
        self.coin_id = coin_id
        self.operation_type = operation_type
        self.quantity = quantity
        self.price_usd = price_usd
        self.fee_usd = fee_usd
        self.executed_at = executed_at
        self.note = note
        self.created_at = created_at
        self.updated_at = updated_at
