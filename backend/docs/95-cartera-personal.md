# Módulo 95 — Cartera personal no custodial

> **Estado:** IMPLEMENTADO Y VERIFICADO LOCALMENTE

## Objetivo

Permitir que cada usuario registre las monedas que posee y consulte el valor
estimado y el rendimiento de su cartera sin custodiar fondos reales.

## Modelo

Cada posición se identifica por `(user_id, coin_id)`:

```text
user_id
coin_id
quantity
average_buy_price
created_at
updated_at
```

Guardar nuevamente la misma moneda actualiza la posición. La operación no
representa una transferencia real; es una referencia manual para análisis.

## Endpoints

```text
GET    /portfolio
POST   /portfolio/holdings
DELETE /portfolio/holdings/{coin_id}
```

Los endpoints obtienen el usuario desde el token Bearer. El cliente no puede
enviar otro `user_id` para operar sobre una cartera ajena.

## Cálculos

- `invested_value = quantity × average_buy_price`;
- `current_value = quantity × current_price`;
- `profit_loss = current_value - invested_value`;
- `profit_loss_percentage` expresa el rendimiento porcentual;
- `allocation_percentage` muestra el peso de cada posición.

El precio actual proviene del último registro de `price_history`. Si todavía no
hay un precio disponible, los valores dependientes del mercado son `null`.

## Decisiones de seguridad

La funcionalidad no maneja wallets blockchain, semillas ni claves privadas.
Es un portfolio tracker no custodial. Una futura integración con exchanges
deberá empezar con permisos de solo lectura y credenciales fuera de la base de
datos principal.

## Verificación

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/unit/test_portfolio_service.py app/tests/api/test_portfolio_endpoints.py -q
```

La siguiente etapa es integrar la cartera en el dashboard y verificarla contra
MySQL con el esquema `portfolio_holdings` creado.
