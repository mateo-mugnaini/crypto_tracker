from datetime import datetime


class Notification:
    """Aviso interno generado por una alerta de precio."""

    def __init__(self, user_id: int, title: str, message: str, coin_id: str, alert_id: int, current_price: float):
        self.id = None
        self.user_id = user_id
        self.alert_id = alert_id
        self.coin_id = coin_id
        self.title = title
        self.message = message
        self.current_price = current_price
        self.is_read = False
        self.created_at: datetime | None = None
