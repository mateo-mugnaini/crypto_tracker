# Módulo 46 - Variaciones de Price History

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Fase**: Data & API
> **Fecha**: 2026-08-10

---

## 1. Objetivo

Calcular la variación de precio entre el primer y el último registro de una criptomoneda.

Nuevo endpoint:

```http
GET /coins/{coin_id}/price-history/variation
```

También se permite limitar el cálculo a un rango de fechas:

```http
GET /coins/bitcoin/price-history/variation?start_date=2026-08-01&end_date=2026-08-10
```

---

## 2. Conceptos aprendidos

- Precio inicial.
- Precio final.
- Diferencia absoluta.
- Diferencia porcentual.
- Subida.
- Bajada.
- Precio sin variación.
- División entre cero.
- Rango temporal aplicado a una consulta.
- Orden cronológico para identificar primer y último registro.
- Cálculo de negocio en Service.

No se implementaron `GROUP BY` ni agregaciones temporales. Esos conceptos pertenecen al Módulo 47.

---

## 3. Fórmulas

### Diferencia absoluta

```text
absolute_change = final_price - initial_price
```

### Diferencia porcentual

```text
percentage_change = (absolute_change / initial_price) * 100
```

Ejemplo:

```text
initial_price = 100
final_price   = 125

absolute_change   = 25
percentage_change = 25%
```

---

## 4. Respuesta de la API

### Subida

```json
{
  "coin_id": "bitcoin",
  "initial_price": 100.0,
  "final_price": 125.0,
  "absolute_change": 25.0,
  "percentage_change": 25.0,
  "trend": "up"
}
```

### Bajada

```json
{
  "coin_id": "bitcoin",
  "initial_price": 200.0,
  "final_price": 150.0,
  "absolute_change": -50.0,
  "percentage_change": -25.0,
  "trend": "down"
}
```

### Sin variación

```json
{
  "coin_id": "bitcoin",
  "initial_price": 100.0,
  "final_price": 100.0,
  "absolute_change": 0.0,
  "percentage_change": 0.0,
  "trend": "unchanged"
}
```

### Sin historial

```json
{
  "coin_id": "bitcoin",
  "initial_price": null,
  "final_price": null,
  "absolute_change": null,
  "percentage_change": null,
  "trend": null
}
```

---

## 5. Caso especial: precio inicial cero

Si el precio inicial es `0`, la diferencia absoluta sí puede calcularse, pero la diferencia porcentual no:

```text
(final - initial) / initial
```

implicaría dividir por cero.

Por eso el resultado es:

```json
{
  "absolute_change": 10.0,
  "percentage_change": null,
  "trend": "up"
}
```

El Service maneja explícitamente este caso.

---

## 6. Arquitectura

```text
GET /coins/bitcoin/price-history/variation
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

El Repository identifica los extremos cronológicos. El Service calcula la variación porque es lógica de negocio, no SQL de persistencia.

---

## 7. Consultas del Repository

Para el registro inicial:

```sql
SELECT price, recorded_at
FROM price_history
WHERE coin_id = %s
  AND recorded_at >= %s
  AND recorded_at <= %s
ORDER BY recorded_at ASC, id ASC
LIMIT 1;
```

Para el registro final:

```sql
SELECT price, recorded_at
FROM price_history
WHERE coin_id = %s
  AND recorded_at >= %s
  AND recorded_at <= %s
ORDER BY recorded_at DESC, id DESC
LIMIT 1;
```

El `id` se utiliza como desempate cuando dos registros tienen exactamente la misma fecha.

---

## 8. Archivos modificados y creados

- `[MODIFY]` `app/repositories/price_history_repository.py`: método `get_initial_and_final_prices()`.
- `[MODIFY]` `app/services/price_history_service.py`: método `get_price_variation()`.
- `[MODIFY]` `app/controllers/price_history_controller.py`: delegación de variaciones.
- `[MODIFY]` `app/api/app.py`: endpoint de variaciones.
- `[NEW]` `app/tests/price_history_variation_repository_test.py`.
- `[NEW]` `app/tests/price_history_variation_service_test.py`.
- `[NEW]` `app/tests/price_history_variation_controller_test.py`.
- `[NEW]` `backend/docs/46-variaciones-price-history.md`.

No se creó un nuevo modelo de dominio ni un Response Model de Pydantic. Los Response Models corresponden al M49.

---

## 9. Tests

Se probaron:

- variación positiva;
- variación negativa;
- precio sin cambios;
- precio inicial igual a cero;
- rango de fechas;
- ausencia de historial;
- rango de fechas inválido;
- orden cronológico de las consultas SQL;
- parámetros SQL;
- delegación Controller -> Service.

Comandos ejecutados desde `backend/`:

```powershell
.venv\Scripts\python.exe -m app.tests.price_history_variation_service_test
.venv\Scripts\python.exe -m app.tests.price_history_variation_controller_test
.venv\Scripts\python.exe -m app.tests.price_history_variation_repository_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
.venv\Scripts\python.exe -m compileall -q app
```

Los tests utilizan mocks y fakes. No se ejecutó una integración contra MySQL real.

---

## 10. Prueba mediante Swagger

Iniciar el servidor:

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
GET /coins/bitcoin/price-history/variation
```

Y con rango:

```http
GET /coins/bitcoin/price-history/variation?start_date=2026-08-01&end_date=2026-08-10
```

La ruta aparece en OpenAPI con el resumen `Get Price Variation`.

---

## 11. Decisiones técnicas

- El Repository obtiene el primer y último registro mediante orden cronológico.
- El Service calcula diferencias y porcentajes.
- Se permiten fechas porque una variación puede analizar un período concreto.
- Se mantiene `None` cuando no existe un valor calculable.
- Se evita dividir por cero.
- Se utiliza `trend` con los valores `up`, `down` y `unchanged`.
- No se introducen estadísticas temporales ni `GROUP BY`.

---

## 12. Estado final

- [x] Precio inicial.
- [x] Precio final.
- [x] Diferencia absoluta.
- [x] Diferencia porcentual.
- [x] Subida.
- [x] Bajada.
- [x] Variación sin cambios.
- [x] Rango opcional de fechas.
- [x] Caso de precio inicial cero.
- [x] Endpoint HTTP.
- [x] Tests creados y ejecutados.
- [x] Documentación creada.

---

## 13. Próximo módulo

**Módulo 47 - Agregaciones temporales**

Se trabajarán `GROUP BY`, agregaciones por hora/día/semana, promedios, mínimos, máximos y cantidades por período.
