class AlertController:
    def __init__(self, service):
        self.service = service

    def get_alerts(self, user_id: int):
        return self.service.get_alerts(user_id)

    def create_alert(self, user_id: int, request):
        return self.service.create_alert(user_id, request)

    def update_alert(self, user_id: int, alert_id: int, request):
        return self.service.update_alert(user_id, alert_id, request)

    def delete_alert(self, user_id: int, alert_id: int):
        success, message = self.service.delete_alert(user_id, alert_id)
        return {"success": success, "message": message}

    def get_notifications(self, user_id: int):
        return self.service.get_notifications(user_id)

    def mark_notification_read(self, user_id: int, notification_id: int):
        success, message = self.service.mark_notification_read(user_id, notification_id)
        return {"success": success, "message": message}

    def mark_all_notifications_read(self, user_id: int):
        success, message = self.service.mark_all_notifications_read(user_id)
        return {"success": success, "message": message}
