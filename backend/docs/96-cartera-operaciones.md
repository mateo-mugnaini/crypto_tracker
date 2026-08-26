# Módulo 96 - Operaciones de cartera

> **Estado:** IMPLEMENTADO EN CÓDIGO; requiere aplicar el SQL en la base de datos

## Objetivo

La tabla `portfolio_holdings` conserva una posición resumida por moneda. Este
módulo agrega `portfolio_operations` para registrar compras y ventas sin
custodiar fondos, claves privadas ni conectarse a un exchange.

## SQL de instalación

Aplicar una sola vez sobre la base configurada en `MYSQL_DATABASE`, después de
verificar que las tablas `users` y `coins` ya existen:

```sql
CREATE TABLE portfolio_operations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coin_id VARCHAR(255) NOT NULL,
    operation_type ENUM('buy', 'sell') NOT NULL,
    quantity DECIMAL(30, 12) NOT NULL,
    price_usd DECIMAL(30, 12) NOT NULL,
    fee_usd DECIMAL(30, 12) NOT NULL DEFAULT 0,
    executed_at DATETIME NOT NULL,
    note VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_portfolio_operations_quantity CHECK (quantity > 0),
    CONSTRAINT chk_portfolio_operations_price CHECK (price_usd > 0),
    CONSTRAINT chk_portfolio_operations_fee CHECK (fee_usd >= 0),
    CONSTRAINT fk_portfolio_operations_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_portfolio_operations_coin
        FOREIGN KEY (coin_id) REFERENCES coins(id),
    INDEX idx_portfolio_operations_user_date (user_id, executed_at, id),
    INDEX idx_portfolio_operations_user_coin (user_id, coin_id, executed_at, id)
);
```

Si la tabla ya existe, no ejecutar el bloque ciegamente. Verificar con:

```sql
SHOW CREATE TABLE portfolio_operations;
SHOW INDEX FROM portfolio_operations;
```

## Contrato HTTP

```text
GET    /portfolio/operations
POST   /portfolio/operations
PUT    /portfolio/operations/{operation_id}
DELETE /portfolio/operations/{operation_id}
```

El usuario se obtiene del token Bearer. `user_id` no forma parte del body, y
todas las lecturas, ediciones y eliminaciones filtran por el usuario autenticado.
Una venta que supera el saldo calculado devuelve `409 insufficient_balance`.

## Ejemplo de body

```json
{
  "coin_id": "bitcoin",
  "operation_type": "buy",
  "quantity": 0.5,
  "price_usd": 40000,
  "fee_usd": 2,
  "executed_at": "2026-08-26T12:00:00",
  "note": "Compra mensual"
}
```

La posición agregada existente sigue funcionando. La consolidación completa de
coste medio y beneficio realizado será el siguiente paso de cartera, una vez que
las operaciones estén disponibles y verificadas en la base de datos.
