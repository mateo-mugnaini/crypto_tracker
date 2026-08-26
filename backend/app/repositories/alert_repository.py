from app.database.connection import get_connection


class AlertRepository:
    def find_all_by_user(self, user_id: int) -> list[dict]:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT pa.id, pa.coin_id, c.symbol, c.name,
                       pa.condition_type AS `condition`, pa.target_price,
                       pa.is_active, pa.last_triggered_at, pa.created_at, pa.updated_at,
                       (SELECT price FROM price_history WHERE coin_id = pa.coin_id
                        ORDER BY recorded_at DESC, id DESC LIMIT 1) AS current_price
                FROM price_alerts pa
                INNER JOIN coins c ON c.id = pa.coin_id
                WHERE pa.user_id = %s
                ORDER BY pa.is_active DESC, pa.created_at DESC, pa.id DESC
                """,
                (user_id,),
            )
            return cursor.fetchall()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def find(self, user_id: int, alert_id: int) -> dict | None:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT pa.id, pa.user_id, pa.coin_id, c.symbol, c.name,
                       pa.condition_type AS `condition`, pa.target_price,
                       pa.is_active, pa.last_triggered_at, pa.created_at, pa.updated_at,
                       (SELECT price FROM price_history WHERE coin_id = pa.coin_id
                        ORDER BY recorded_at DESC, id DESC LIMIT 1) AS current_price
                FROM price_alerts pa INNER JOIN coins c ON c.id = pa.coin_id
                WHERE pa.user_id = %s AND pa.id = %s LIMIT 1
                """,
                (user_id, alert_id),
            )
            return cursor.fetchone()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def create(self, alert) -> int:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(
                """
                INSERT INTO price_alerts
                    (user_id, coin_id, condition_type, target_price, is_active,
                     last_condition_met, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """,
                (alert.user_id, alert.coin_id, alert.condition, alert.target_price, alert.is_active),
            )
            connection.commit()
            return cursor.lastrowid
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def update(self, user_id: int, alert_id: int, values: dict) -> bool:
        assignments = []
        params = []
        columns = {"condition": "condition_type", "target_price": "target_price", "is_active": "is_active"}
        for field, value in values.items():
            assignments.append(f"{columns[field]} = %s")
            params.append(value)
        assignments.extend(["last_condition_met = NULL", "updated_at = CURRENT_TIMESTAMP"])
        params.extend([alert_id, user_id])

        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(
                f"UPDATE price_alerts SET {', '.join(assignments)} WHERE id = %s AND user_id = %s",
                tuple(params),
            )
            changed = cursor.rowcount > 0
            connection.commit()
            return changed
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def delete(self, user_id: int, alert_id: int) -> bool:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute("DELETE FROM price_alerts WHERE id = %s AND user_id = %s", (alert_id, user_id))
            deleted = cursor.rowcount > 0
            connection.commit()
            return deleted
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def find_active_by_coin(self, coin_id: str) -> list[dict]:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT id, user_id, coin_id, condition_type AS `condition`,
                       target_price, last_condition_met
                FROM price_alerts WHERE coin_id = %s AND is_active = 1
                """,
                (coin_id,),
            )
            return cursor.fetchall()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def claim_trigger(self, alert_id: int) -> bool:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(
                """
                UPDATE price_alerts
                SET last_condition_met = 1, last_triggered_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND is_active = 1
                  AND (last_condition_met IS NULL OR last_condition_met = 0)
                """,
                (alert_id,),
            )
            claimed = cursor.rowcount > 0
            connection.commit()
            return claimed
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def reset_trigger(self, alert_id: int) -> None:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(
                "UPDATE price_alerts SET last_condition_met = 0, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (alert_id,),
            )
            connection.commit()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def create_notification(self, notification) -> int:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(
                """
                INSERT INTO notifications
                    (user_id, alert_id, coin_id, title, message, current_price, is_read, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, 0, CURRENT_TIMESTAMP)
                """,
                (notification.user_id, notification.alert_id, notification.coin_id,
                 notification.title, notification.message, notification.current_price),
            )
            connection.commit()
            return cursor.lastrowid
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def find_notifications_by_user(self, user_id: int, limit: int = 50) -> list[dict]:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT n.id, n.alert_id, n.coin_id, c.symbol, c.name, n.title,
                       n.message, n.current_price, n.is_read, n.created_at
                FROM notifications n LEFT JOIN coins c ON c.id = n.coin_id
                WHERE n.user_id = %s ORDER BY n.created_at DESC, n.id DESC LIMIT %s
                """,
                (user_id, limit),
            )
            return cursor.fetchall()
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def count_unread_notifications(self, user_id: int) -> int:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM notifications WHERE user_id = %s AND is_read = 0", (user_id,))
            return int(cursor.fetchone()[0])
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def mark_notification_read(self, user_id: int, notification_id: int) -> bool:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(
                "UPDATE notifications SET is_read = 1 WHERE id = %s AND user_id = %s",
                (notification_id, user_id),
            )
            changed = cursor.rowcount > 0
            connection.commit()
            return changed
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()

    def mark_all_notifications_read(self, user_id: int) -> int:
        connection = get_connection()
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = %s AND is_read = 0", (user_id,))
            changed = cursor.rowcount
            connection.commit()
            return changed
        finally:
            if cursor is not None:
                cursor.close()
            connection.close()
