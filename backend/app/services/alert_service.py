from app.exceptions.domain_exception import (
    CoinNotFoundException,
    PriceAlertNotFoundException,
    UserNotFoundException,
)
from app.models.notification import Notification
from app.models.price_alert import PriceAlert


class AlertService:
    def __init__(self, alert_repository, user_repository, coin_repository):
        self.alert_repository = alert_repository
        self.user_repository = user_repository
        self.coin_repository = coin_repository

    def get_alerts(self, user_id: int) -> dict:
        self._ensure_user(user_id)
        rows = self.alert_repository.find_all_by_user(user_id)
        return {"data": rows, "total": len(rows)}

    def create_alert(self, user_id: int, request):
        self._ensure_user(user_id)
        self._ensure_coin(request.coin_id)
        alert = PriceAlert(user_id, request.coin_id, request.condition, request.target_price)
        alert.id = self.alert_repository.create(alert)
        return self.alert_repository.find(user_id, alert.id)

    def update_alert(self, user_id: int, alert_id: int, request):
        self._ensure_user(user_id)
        if self.alert_repository.find(user_id, alert_id) is None:
            raise PriceAlertNotFoundException("La alerta no existe.")
        values = request.model_dump(exclude_none=True)
        if values:
            self.alert_repository.update(user_id, alert_id, values)
        return self.alert_repository.find(user_id, alert_id)

    def delete_alert(self, user_id: int, alert_id: int) -> tuple[bool, str]:
        self._ensure_user(user_id)
        if not self.alert_repository.delete(user_id, alert_id):
            raise PriceAlertNotFoundException("La alerta no existe.")
        return True, "Alerta eliminada correctamente."

    def get_notifications(self, user_id: int) -> dict:
        self._ensure_user(user_id)
        rows = self.alert_repository.find_notifications_by_user(user_id)
        return {"data": rows, "total": len(rows), "unread": self.alert_repository.count_unread_notifications(user_id)}

    def mark_notification_read(self, user_id: int, notification_id: int) -> tuple[bool, str]:
        self._ensure_user(user_id)
        self.alert_repository.mark_notification_read(user_id, notification_id)
        return True, "Notificación marcada como leída."

    def mark_all_notifications_read(self, user_id: int) -> tuple[bool, str]:
        self._ensure_user(user_id)
        self.alert_repository.mark_all_notifications_read(user_id)
        return True, "Notificaciones marcadas como leídas."

    def evaluate_coin(self, coin_id: str, current_price: float) -> int:
        """Genera como máximo un aviso al entrar en la zona de la condición."""
        created = 0
        for alert in self.alert_repository.find_active_by_coin(coin_id):
            met = current_price >= float(alert["target_price"]) if alert["condition"] == "above" else current_price <= float(alert["target_price"])
            if not met:
                if alert.get("last_condition_met"):
                    self.alert_repository.reset_trigger(alert["id"])
                continue
            if not self.alert_repository.claim_trigger(alert["id"]):
                continue
            direction = "superó" if alert["condition"] == "above" else "cayó por debajo de"
            target = float(alert["target_price"])
            notification = Notification(
                user_id=alert["user_id"], alert_id=alert["id"], coin_id=coin_id,
                title=f"Alerta de {coin_id}",
                message=f"El precio {direction} ${target:,.2f} y llegó a ${current_price:,.2f}.",
                current_price=current_price,
            )
            self.alert_repository.create_notification(notification)
            created += 1
        return created

    def _ensure_user(self, user_id: int):
        if not self.user_repository.exists(user_id):
            raise UserNotFoundException("El usuario no existe.")

    def _ensure_coin(self, coin_id: str):
        if not self.coin_repository.exists(coin_id):
            raise CoinNotFoundException("La moneda no existe.")
