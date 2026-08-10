# Módulo 45 - Estadísticas de Price History

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Fase**: Data & API
> **Fecha**: 2026-08-10

---

## 1. Objetivo

Obtener estadísticas agregadas del historial de precios de una criptomoneda mediante `COUNT`, `MIN`, `MAX` y `AVG`.

El módulo agrega un endpoint específico:

```http
GET /coins/{coin_id}/price-history/statistics
```

No devuelve los registros individuales ni utiliza paginación. Devuelve un resumen calculado directamente por MySQL.

---

## 2. Conceptos aprendidos

- Funciones de agregación SQL.
- `COUNT(*)`.
- `MIN(price)`.
- `MAX(price)`.
- `AVG(price)`.
- Alias SQL.
- Consultas agregadas por criptomoneda.
- Diferencia entre un listado y un resumen estadístico.
- Conversión de `Decimal` de MySQL a `float` para la respuesta Python.
- Representación de una criptomoneda sin historial.
- Separación entre Repository, Service, Controller y API.

No se introdujeron `GROUP BY`, períodos temporales ni variaciones porcentuales. Esos conceptos pertenecen a M47 y M46 respectivamente.

---

## 3. Problema real

Para responder cuál fue el precio mínimo, máximo o promedio, sería posible recuperar todos los registros y calcularlos en Python, pero eso sería ineficiente:

```text
MySQL → millones de filas → Python → cálculo
```

La solución es delegar el cálculo al motor de base de datos:

```text
MySQL → una fila agregada → Service → API
```

La base de datos está optimizada para realizar este tipo de operaciones y la API recibe una respuesta pequeña.

---

## 4. Arquitectura y flujo

```text
GET /coins/bitcoin/price-history/statistics
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

### API

Define el path parameter `coin_id` y publica la ruta.

### Controller

Delega la solicitud al Service.

### Service

Valida que `coin_id` no esté vacío y transforma el resultado de persistencia en una respuesta estable.

### Repository

Ejecuta exclusivamente el SQL agregado.

---

## 5. Consulta SQL

```sql
SELECT
    COUNT(*) AS count,
    MIN(price) AS min_price,
    MAX(price) AS max_price,
    AVG(price) AS average_price
FROM price_history
WHERE coin_id = %s;
```

El valor se pasa como parámetro:

```python
(coin_id,)
```

La coma es importante: crea una tupla de un solo elemento en Python.

La consulta devuelve una fila con este formato interno:

```text
count          → cantidad de registros
min_price      → precio menor
max_price      → precio mayor
average_price  → precio promedio
```

---

## 6. Respuesta de la API

Ejemplo con historial existente:

```json
{
  "coin_id": "bitcoin",
  "count": 3,
  "min_price": 64000.0,
  "max_price": 65000.0,
  "average_price": 64500.0
}
```

Si la moneda no tiene registros:

```json
{
  "coin_id": "dogecoin",
  "count": 0,
  "min_price": null,
  "max_price": null,
  "average_price": null
}
```

Esto ocurre porque `COUNT(*)` devuelve `0`, mientras que `MIN`, `MAX` y `AVG` no tienen un valor calculable sobre un conjunto vacío.

Todavía no se creó un Pydantic Response Model porque ese concepto corresponde al M49.

---

## 7. Archivos modificados y creados

- `[MODIFY]` `app/repositories/price_history_repository.py`: método `get_statistics_by_coin_id()`.
- `[MODIFY]` `app/services/price_history_service.py`: método `get_price_statistics()` y conversión numérica.
- `[MODIFY]` `app/controllers/price_history_controller.py`: delegación de estadísticas.
- `[MODIFY]` `app/api/app.py`: endpoint HTTP de estadísticas.
- `[NEW]` `app/tests/price_history_statistics_repository_test.py`.
- `[NEW]` `app/tests/price_history_statistics_service_test.py`.
- `[NEW]` `app/tests/price_history_statistics_controller_test.py`.
- `[NEW]` `backend/docs/45-estadisticas-price-history.md`.

No se modificó el modelo `PriceHistory`, porque las estadísticas son una proyección calculada y no una nueva entidad persistente.

---

## 8. Decisiones arquitectónicas

### Cálculo en MySQL

Se eligió SQL agregado para evitar transferir todos los registros a Python.

### Sin nuevo modelo de dominio

El resultado es un resumen de consulta, no una entidad que deba guardarse. Crear una clase únicamente para transportar cuatro valores sería complejidad innecesaria en este módulo.

### Conversión de tipos

MySQL puede devolver columnas `DECIMAL` como `Decimal` en Python. El Service convierte los valores a `float` para mantener una respuesta compatible con el modelo actual y con la serialización HTTP.

### Sin paginación ni ordenamiento

Una consulta agregada devuelve una única fila. `LIMIT`, `OFFSET` y `ORDER BY` no aportan valor en esta operación.

---

## 9. Tests

### Repository

Verifica:

- presencia de `COUNT`, `MIN`, `MAX` y `AVG`;
- filtro por `coin_id`;
- parametrización `(coin_id,)`;
- cierre de cursor y conexión.

### Service

Verifica:

- transformación de `Decimal` a `float`;
- respuesta completa;
- moneda sin historial;
- rechazo de `coin_id` vacío;
- respuesta inesperada del Repository.

### Controller

Verifica que delegue exactamente en el Service.

Comandos ejecutados desde `backend/`:

```powershell
.venv\Scripts\python.exe -m app.tests.price_history_statistics_service_test
.venv\Scripts\python.exe -m app.tests.price_history_statistics_controller_test
.venv\Scripts\python.exe -m app.tests.price_history_statistics_repository_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
.venv\Scripts\python.exe -m compileall -q app
```

Resultado verificado:

```text
Statistics Service tests: PASSED
Statistics Controller tests: PASSED
Statistics Repository tests: PASSED
Suite global: 7 tests OK
compileall: OK
```

Los tests utilizan mocks y fakes. No se ejecutó una integración contra MySQL real en este módulo.

---

## 10. Prueba mediante Swagger

Iniciar el servidor desde `backend/`:

```powershell
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
```

Abrir:

```text
http://127.0.0.1:8000/docs
```

Ejecutar:

```http
GET /coins/bitcoin/price-history/statistics
```

Casos a probar:

1. Moneda con historial: debe devolver las cuatro estadísticas.
2. Moneda sin historial: `count=0` y valores estadísticos `null`.
3. `coin_id` vacío: FastAPI debe rechazarlo por la validación del path.

La ruta aparece en OpenAPI con el resumen `Get Price Statistics`.

---

## 11. Errores comunes

### Calcular todo en Python

Esto transfiere más datos y escala peor. Las agregaciones deben ejecutarse en SQL cuando sea posible.

### Confundir `COUNT(*)` con `COUNT(price)`

`COUNT(*)` cuenta filas. `COUNT(price)` ignora valores `NULL` de la columna. En este proyecto `price` es obligatorio, pero se utiliza `COUNT(*)` porque queremos contar registros.

### Intentar usar `GROUP BY`

`GROUP BY` corresponde a agregaciones temporales del M47. M45 calcula un resumen global para una moneda.

### No contemplar una respuesta vacía

Una moneda puede existir sin historial. El contrato devuelve `count=0` y valores nulos en lugar de inventar ceros para precios que no existen.

---

## 12. Estado final

- [x] `COUNT` implementado.
- [x] `MIN` implementado.
- [x] `MAX` implementado.
- [x] `AVG` implementado.
- [x] Estadísticas por moneda.
- [x] Repository implementado.
- [x] Service implementado.
- [x] Controller implementado.
- [x] Endpoint HTTP implementado.
- [x] Caso sin historial contemplado.
- [x] Tests creados y ejecutados.
- [x] Documentación creada.

---

## 13. Próximo módulo

**Módulo 46 - Variaciones de precio**

Se trabajarán precio inicial, precio final, diferencia absoluta, diferencia porcentual, subidas y bajadas.

Las agregaciones temporales y `GROUP BY` quedan reservadas para el M47.
