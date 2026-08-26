# Módulo 21: alertas y notificaciones

Este módulo permite crear alertas privadas por moneda y precio. Las condiciones disponibles son `above` (mayor o igual al objetivo) y `below` (menor o igual al objetivo).

La evaluación ocurre después de cada precio guardado por el endpoint de actualización o por el scheduler. La alerta solo genera una notificación al entrar en la zona objetivo. Mientras el precio permanezca dentro de ella no se repite el aviso; debe salir y entrar nuevamente para volver a notificar.

## Migración MySQL

Ejecutar una sola vez sobre la base configurada en `MYSQL_DATABASE`:

```sql
CREATE TABLE IF NOT EXISTS price_alerts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    coin_id VARCHAR(64) NOT NULL,
    condition_type ENUM('above', 'below') NOT NULL,
    target_price DECIMAL(30, 12) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_condition_met BOOLEAN NULL,
    last_triggered_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_price_alerts_user_active (user_id, is_active),
    INDEX idx_price_alerts_coin_active (coin_id, is_active)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    alert_id BIGINT UNSIGNED NULL,
    coin_id VARCHAR(64) NULL,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(500) NOT NULL,
    current_price DECIMAL(30, 12) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_notifications_user_read (user_id, is_read, created_at),
    INDEX idx_notifications_alert (alert_id)
);
```

## Endpoints protegidos

- `GET /alerts`, `POST /alerts`, `PATCH /alerts/{id}`, `DELETE /alerts/{id}`.
- `GET /notifications` devuelve las últimas notificaciones y el contador `unread`.
- `POST /notifications/{id}/read` y `POST /notifications/read-all` actualizan la lectura.

El usuario autenticado se obtiene del token Bearer; nunca se acepta un `user_id` desde el cliente.
