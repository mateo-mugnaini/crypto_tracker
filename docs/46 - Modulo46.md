Módulo 46 — Variaciones de Price History

1. Objetivo
   Calcular la variación entre el primer y el último precio de una criptomoneda.
   Nuevo endpoint:
   GET /coins/{coin_id}/price-history/variation
   También acepta un rango opcional:
   GET /coins/bitcoin/price-history/variation?start_date=2026-08-01&end_date=2026-08-10
2. Fórmulas
   absolute_change = final_price - initial_price
   percentage_change = (absolute_change / initial_price) \* 100
   Ejemplo:
   Precio inicial: 100
   Precio final: 125

Diferencia absoluta: 25
Diferencia porcentual: 25%
Tendencia: up
Respuesta:
{
"coin_id": "bitcoin",
"initial_price": 100.0,
"final_price": 125.0,
"absolute_change": 25.0,
"percentage_change": 25.0,
"trend": "up"
}
Valores posibles para trend:
up
down
unchanged
Si no existe historial:
{
"coin_id": "bitcoin",
"initial_price": null,
"final_price": null,
"absolute_change": null,
"percentage_change": null,
"trend": null
}
Si el precio inicial es 0, la diferencia porcentual devuelve null para evitar división por cero. 3. Arquitectura
FastAPI
↓
Controller
↓
Service
↓
Repository
↓
MySQL
Repository: obtiene el primer y último registro cronológico.
Service: calcula diferencias, porcentajes y tendencia.
Controller: delega.
API: expone el endpoint. 4. Archivos modificados
[price_history_repository.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/repositories/price_history_repository.py)
[price_history_service.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/services/price_history_service.py)
[price_history_controller.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/controllers/price_history_controller.py)
[app.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/api/app.py)
Tests creados:
[price_history_variation_service_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_variation_service_test.py)
[price_history_variation_controller_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_variation_controller_test.py)
[price_history_variation_repository_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_variation_repository_test.py)
Documentación:
[46-variaciones-price-history.md](/C:/Users/mateo/Projects/crypto_tracker/backend/docs/46-variaciones-price-history.md) 5. Código principal agregado
Repository
def get_initial_and_final_prices(
self,
coin_id: str,
start_date: datetime | None = None,
end_date: datetime | None = None,
) -> dict:
connection = get_connection()
cursor = connection.cursor(dictionary=True)

    conditions = ["coin_id = %s"]
    params = [coin_id]

    if start_date is not None:
        conditions.append("recorded_at >= %s")
        params.append(start_date)

    if end_date is not None:
        conditions.append("recorded_at <= %s")
        params.append(end_date)

    where_clause = " AND ".join(conditions)

    initial_query = f"""
        SELECT price, recorded_at
        FROM price_history
        WHERE {where_clause}
        ORDER BY recorded_at ASC, id ASC
        LIMIT 1
    """

    final_query = f"""
        SELECT price, recorded_at
        FROM price_history
        WHERE {where_clause}
        ORDER BY recorded_at DESC, id DESC
        LIMIT 1
    """

    try:
        cursor.execute(initial_query, tuple(params))
        initial_row = cursor.fetchone()

        cursor.execute(final_query, tuple(params))
        final_row = cursor.fetchone()

        return {
            "initial_price": (
                initial_row["price"] if initial_row is not None else None
            ),
            "final_price": (
                final_row["price"] if final_row is not None else None
            ),
        }

    finally:
        cursor.close()
        connection.close()

Service
def get_price_variation(
self,
coin_id: str,
start_date: date | None = None,
end_date: date | None = None,
) -> dict:
coin_id = coin_id.strip()

    if not coin_id:
        raise ValueError("coin_id cannot be empty")

    if start_date is not None and end_date is not None:
        if start_date > end_date:
            raise ValueError("start_date cannot be greater than end_date")

    start_datetime = None

    if start_date is not None:
        start_datetime = datetime.combine(start_date, time.min)

    end_datetime = None

    if end_date is not None:
        end_datetime = datetime.combine(end_date, time.max)

    prices = self.price_history_repository.get_initial_and_final_prices(
        coin_id=coin_id,
        start_date=start_datetime,
        end_date=end_datetime,
    )

    initial_price = self._to_float_or_none(prices["initial_price"])
    final_price = self._to_float_or_none(prices["final_price"])

    if initial_price is None or final_price is None:
        return {
            "coin_id": coin_id,
            "initial_price": initial_price,
            "final_price": final_price,
            "absolute_change": None,
            "percentage_change": None,
            "trend": None,
        }

    absolute_change = final_price - initial_price

    percentage_change = None

    if initial_price != 0:
        percentage_change = (absolute_change / initial_price) * 100

    if absolute_change > 0:
        trend = "up"
    elif absolute_change < 0:
        trend = "down"
    else:
        trend = "unchanged"

    return {
        "coin_id": coin_id,
        "initial_price": initial_price,
        "final_price": final_price,
        "absolute_change": absolute_change,
        "percentage_change": percentage_change,
        "trend": trend,
    }

Controller
def get_price_variation(
self,
coin_id: str,
start_date: date | None = None,
end_date: date | None = None,
) -> dict:
return self.price_history_service.get_price_variation(
coin_id=coin_id,
start_date=start_date,
end_date=end_date,
)
API
@app.get("/coins/{coin_id}/price-history/variation")
def get_price_variation(
coin_id: str = Path(
...,
min_length=1,
description="ID de la criptomoneda",
),
start_date: date | None = None,
end_date: date | None = None,
):
return container.price_history_controller.get_price_variation(
coin_id=coin_id,
start_date=start_date,
end_date=end_date,
) 6. Tests ejecutados
cd backend

.venv\Scripts\python.exe -m app.tests.price_history_variation_service_test
.venv\Scripts\python.exe -m app.tests.price_history_variation_controller_test
.venv\Scripts\python.exe -m app.tests.price_history_variation_repository_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "\*\_test.py"
.venv\Scripts\python.exe -m compileall -q app
Resultado:
8 tests OK
Variation Service tests: PASSED
Variation Controller tests: PASSED
Variation Repository tests: PASSED
compileall: OK
También se verificó que OpenAPI contiene:
/coins/{coin_id}/price-history/variation 7. Swagger
Iniciar:
cd backend
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
Abrir:
http://127.0.0.1:8000/docs
Probar:
GET /coins/bitcoin/price-history/variation
