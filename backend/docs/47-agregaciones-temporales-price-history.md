# Módulo 47 - Agregaciones Temporales de Price History

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Fase**: Data & API
> **Fecha**: 2026-08-10

---

## 1. Objetivo

Agrupar el historial de precios por períodos temporales y calcular estadísticas para cada grupo.

Nuevo endpoint:

```http
GET /coins/{coin_id}/price-history/aggregations?period=day
```

Períodos permitidos:

```text
hour
day
week
```

---

## 2. Conceptos aprendidos

- `GROUP BY`.
- Agregaciones por hora, día y semana.
- `DATE()`.
- `DATE_FORMAT()`.
- `DATE_SUB()`.
- `WEEKDAY()`.
- `AVG`, `MIN`, `MAX` y `COUNT` por grupo.
- Whitelist de expresiones SQL.
- Análisis temporal.
- Ordenamiento cronológico de los períodos.
- Diferencia entre agregación global y agregación temporal.

M45 calculaba un único resumen global. M47 calcula una fila por cada período.

---

## 3. Problema real

Una consulta global responde:

```text
¿Cuál fue el precio promedio de Bitcoin en todo el historial?
```

Una agregación temporal responde:

```text
¿Cuál fue el precio promedio de Bitcoin cada día?
```

Sin `GROUP BY`, todos los registros formarían un único grupo. Con `GROUP BY`, cada hora, día o semana se convierte en un grupo independiente.

---

## 4. Respuesta de la API

Ejemplo diario:

```json
[
  {
    "period": "2026-08-01",
    "average_price": 105.0,
    "min_price": 100.0,
    "max_price": 110.0,
    "count": 2
  },
  {
    "period": "2026-08-02",
    "average_price": 112.0,
    "min_price": 108.0,
    "max_price": 116.0,
    "count": 3
  }
]
```

Si no existen registros, la API devuelve:

```json
[]
```

---

## 5. Expresiones temporales

### Por hora

```sql
DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00')
```

Agrupa todos los registros de la misma hora.

### Por día

```sql
DATE(recorded_at)
```

Elimina la parte horaria y conserva el día calendario.

### Por semana

```sql
DATE_SUB(
    DATE(recorded_at),
    INTERVAL WEEKDAY(recorded_at) DAY
)
```

Representa cada semana mediante la fecha de su lunes. Esto evita agrupar semanas de años distintos utilizando solamente un número de semana.

---

## 6. Seguridad de SQL dinámico

No se concatena directamente el período recibido desde HTTP:

```python
query += f" GROUP BY {period}"
```

En su lugar se utiliza una whitelist:

```python
AGGREGATION_PERIODS = {
    "hour": "DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00')",
    "day": "DATE(recorded_at)",
    "week": (
        "DATE_SUB(DATE(recorded_at), "
        "INTERVAL WEEKDAY(recorded_at) DAY)"
    ),
}
```

Solo las expresiones definidas por el sistema pueden llegar a `SELECT`, `GROUP BY` y `ORDER BY`.

Los valores de `coin_id`, `start_date` y `end_date` continúan utilizando parámetros `%s`.

---

## 7. SQL generado

Para agregación diaria:

```sql
SELECT
    DATE(recorded_at) AS period,
    AVG(price) AS average_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price,
    COUNT(*) AS count
FROM price_history
WHERE coin_id = %s
  AND recorded_at >= %s
  AND recorded_at <= %s
GROUP BY DATE(recorded_at)
ORDER BY DATE(recorded_at) ASC;
```

---

## 8. Arquitectura

```text
GET /coins/bitcoin/price-history/aggregations?period=day
                         |
                         v
                     FastAPI
                         |
                         v
             PriceHistoryController
                         |
                         v
               PriceHistoryService
                         |
                         v
             PriceHistoryRepository
                         |
                         v
                       MySQL
```

### Repository

Construye la consulta temporal segura y ejecuta el `GROUP BY`.

### Service

Valida el período, convierte fechas y transforma valores `Decimal` a `float`.

### Controller

Delega la operación.

### API

Valida `period` mediante `Literal` y publica el contrato OpenAPI.

---

## 9. Archivos modificados y creados

- `[MODIFY]` `app/repositories/price_history_repository.py`: whitelist temporal y `get_price_aggregations()`.
- `[MODIFY]` `app/services/price_history_service.py`: `get_price_aggregations()`.
- `[MODIFY]` `app/controllers/price_history_controller.py`: delegación de agregaciones.
- `[MODIFY]` `app/api/app.py`: endpoint de agregaciones.
- `[NEW]` `app/tests/price_history_aggregation_repository_test.py`.
- `[NEW]` `app/tests/price_history_aggregation_service_test.py`.
- `[NEW]` `app/tests/price_history_aggregation_controller_test.py`.
- `[NEW]` `backend/docs/47-agregaciones-temporales-price-history.md`.

No se creó un modelo adicional ni un Response Model Pydantic. Los Response Models corresponden al M49.

---

## 10. Tests

Se probaron:

- agregación diaria;
- período semanal;
- conversión de fechas;
- conversión de `Decimal`;
- lista vacía sin historial;
- período inválido;
- rango de fechas inválido;
- presencia de `AVG`, `MIN`, `MAX`, `COUNT`;
- presencia de `GROUP BY`;
- orden temporal;
- parámetros SQL;
- delegación Controller -> Service.

Comandos ejecutados desde `backend/`:

```powershell
.venv\Scripts\python.exe -m app.tests.price_history_aggregation_service_test
.venv\Scripts\python.exe -m app.tests.price_history_aggregation_controller_test
.venv\Scripts\python.exe -m app.tests.price_history_aggregation_repository_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
.venv\Scripts\python.exe -m compileall -q app
```

Resultado verificado:

```text
Suite global: 10 tests OK
Aggregation Service tests: PASSED
Aggregation Controller tests: PASSED
Aggregation Repository tests: PASSED
compileall: OK
```

Los tests utilizan mocks y fakes. No se ejecutó una integración contra MySQL real.

---

## 11. Prueba mediante Swagger

Iniciar:

```powershell
cd backend
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
```

Abrir:

```text
http://127.0.0.1:8000/docs
```

Probar:

```http
GET /coins/bitcoin/price-history/aggregations?period=day
```

También:

```http
GET /coins/bitcoin/price-history/aggregations?period=hour
GET /coins/bitcoin/price-history/aggregations?period=week
```

Con fechas:

```http
GET /coins/bitcoin/price-history/aggregations?period=day&start_date=2026-08-01&end_date=2026-08-31
```

Un período diferente de `hour`, `day` o `week` debe producir un error HTTP 422 desde FastAPI.

---

## 12. Decisiones técnicas

- Se eligieron tres períodos explícitos: hora, día y semana.
- La semana comienza el lunes.
- Se utiliza una whitelist para expresiones SQL.
- Se ordenan los grupos cronológicamente.
- Se mantienen filtros de fecha opcionales.
- Se devuelve una lista vacía si no hay datos.
- No se introdujeron capas o clases adicionales.

---

## 13. Estado final

- [x] Agregación por hora.
- [x] Agregación por día.
- [x] Agregación por semana.
- [x] `GROUP BY`.
- [x] Promedio por período.
- [x] Mínimo por período.
- [x] Máximo por período.
- [x] Cantidad por período.
- [x] Validación de períodos.
- [x] Protección contra SQL Injection.
- [x] Endpoint HTTP.
- [x] Tests creados y ejecutados.
- [x] Documentación creada.

---

## 14. Próximo módulo

**Módulo 48 - Pydantic Request Models**

Se comenzará la fase de FastAPI profesional con modelos de entrada, `BaseModel`, request body y validación automática.
