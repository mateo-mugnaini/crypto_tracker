# Módulo 42 — Filtros de Price History

> **Estado:** TERMINADO
> **Proyecto:** Crypto Tracker — Backend
> **Módulo:** 42
> **Área:** Price History / Consultas avanzadas
> **Estado de tests:** TODOS LOS TESTS PASARON

---

# 1. Objetivo

El objetivo del Módulo 42 fue ampliar la consulta del historial de precios (`Price History`) para permitir aplicar filtros sobre:

- fecha inicial;
- fecha final;
- precio mínimo;
- precio máximo.

La funcionalidad permite realizar consultas más específicas sobre los precios históricos de una criptomoneda.

Por ejemplo:

```text
Obtener Bitcoin
desde el 7 de agosto
hasta el 8 de agosto
con precios entre 64.000 y 65.000
```

La funcionalidad mantiene la arquitectura existente:

```text
FastAPI
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
MySQL
```

---

# 2. Conceptos aprendidos

Durante este módulo se trabajaron los siguientes conceptos:

- Query Parameters en FastAPI.
- Filtros opcionales.
- `date` y `datetime`.
- Conversión de `date` a límites de tiempo.
- Validación de rangos.
- Construcción dinámica de consultas SQL.
- SQL parametrizado.
- Combinación de filtros.
- Repository Pattern.
- Service Layer.
- Mocking mediante `unittest.mock`.
- Verificación de llamadas entre capas.
- Tests unitarios de Service.
- Tests unitarios de Controller.

---

# 3. Nuevos filtros

El endpoint de historial permite utilizar:

```text
start_date
end_date
min_price
max_price
```

Todos son opcionales.

Por lo tanto, pueden realizarse consultas como:

```text
GET /coins/bitcoin/price-history
```

o:

```text
GET /coins/bitcoin/price-history?min_price=64000
```

o:

```text
GET /coins/bitcoin/price-history?max_price=65000
```

o:

```text
GET /coins/bitcoin/price-history?start_date=2026-08-07&end_date=2026-08-08
```

o combinando todos los filtros:

```text
GET /coins/bitcoin/price-history?start_date=2026-08-07&end_date=2026-08-08&min_price=64000&max_price=65000
```

---

# 4. Arquitectura

El flujo implementado es:

```text
HTTP Request
     │
     ▼
FastAPI
     │
     ▼
PriceHistoryController
     │
     ▼
PriceHistoryService
     │
     ▼
PriceHistoryRepository
     │
     ▼
MySQL
```

Cada capa mantiene una responsabilidad específica.

## FastAPI

Recibe los parámetros HTTP.

```text
start_date
end_date
min_price
max_price
```

---

## Controller

Recibe los datos procedentes de FastAPI y delega la operación al Service.

No contiene lógica de negocio.

---

## Service

Es responsable de las reglas relacionadas con los filtros.

Valida:

```text
start_date <= end_date
```

y:

```text
min_price <= max_price
```

También convierte las fechas en límites de tiempo.

---

## Repository

Construye y ejecuta la consulta SQL.

Se encarga de:

- aplicar los filtros;
- utilizar parámetros SQL;
- ejecutar la consulta;
- convertir las filas de MySQL a objetos `PriceHistory`.

---

# 5. Manejo de fechas

Una fecha recibida por la API representa un día completo.

Por ejemplo:

```text
start_date=2026-08-07
```

se transforma en:

```text
2026-08-07 00:00:00
```

Mientras que:

```text
end_date=2026-08-08
```

se transforma en:

```text
2026-08-08 23:59:59.999999
```

Esto permite incluir todos los registros del día final.

Conceptualmente:

```text
2026-08-07
    ↓
00:00:00

2026-08-08
    ↓
23:59:59.999999
```

---

# 6. Validación de rangos

El Service valida que el rango de fechas sea válido.

No se permite:

```text
start_date > end_date
```

En ese caso se genera:

```python
ValueError("start_date cannot be greater than end_date")
```

También se valida el rango de precios.

No se permite:

```text
min_price > max_price
```

En ese caso:

```python
ValueError("min_price cannot be greater than max_price")
```

Estas validaciones pertenecen al Service porque representan reglas de negocio y no reglas específicas de HTTP.

---

# 7. Consulta SQL

El Repository construye una consulta base:

```sql
SELECT
    id,
    coin_id,
    price,
    recorded_at
FROM price_history
WHERE coin_id = %s
```

Después agrega dinámicamente los filtros necesarios.

Por ejemplo:

```sql
AND recorded_at >= %s
```

```sql
AND recorded_at <= %s
```

```sql
AND price >= %s
```

```sql
AND price <= %s
```

Finalmente:

```sql
ORDER BY recorded_at ASC
```

El orden de construcción es importante.

El `ORDER BY` debe aparecer después de todos los filtros.

---

# 8. SQL parametrizado

Los valores no se interpolan directamente en el SQL.

Se utilizan placeholders:

```python
query += " AND price >= %s"
params.append(min_price)
```

Y posteriormente:

```python
cursor.execute(query, params)
```

Esto permite mantener consultas parametrizadas y evita construir SQL directamente a partir de valores proporcionados por el usuario.

---

# 9. Combinación de filtros

Los filtros pueden utilizarse independientemente o combinados.

Ejemplo:

```text
coin_id = bitcoin
start_date = 2026-08-07
end_date = 2026-08-08
min_price = 64000
max_price = 65000
```

La consulta conceptualmente será:

```sql
SELECT
    id,
    coin_id,
    price,
    recorded_at
FROM price_history
WHERE coin_id = %s
AND recorded_at >= %s
AND recorded_at <= %s
AND price >= %s
AND price <= %s
ORDER BY recorded_at ASC
```

---

# 10. Tests del Service

Se implementaron tests para comprobar el comportamiento del Service.

Archivo:

```text
app/tests/price_history_service_test.py
```

Se comprobaron:

```text
[✓] Consulta sin filtros
[✓] Filtro min_price
[✓] Filtro max_price
[✓] Rango de precios
[✓] Rango de precios inválido
[✓] Combinación de filtros
```

También se verificó que el Service llamara al Repository con los parámetros correctos.

Por ejemplo:

```python
repository.find_by_coin_id.assert_called_once_with(
    coin_id="bitcoin",
    start_date=None,
    end_date=None,
    min_price=64000,
    max_price=65000,
)
```

Esto permite comprobar no solamente el resultado, sino también la interacción entre las capas.

---

# 11. Tests del Controller

Archivo:

```text
app/tests/price_history_controller_test.py
```

Se comprobaron:

```text
[✓] Consulta sin filtros
[✓] Filtros de precio
[✓] Todos los filtros
```

Los tests verifican que el Controller delegue correctamente al Service.

Por ejemplo:

```python
service.get_price_history.assert_called_once_with(
    coin_id="bitcoin",
    start_date=None,
    end_date=None,
    min_price=64000,
    max_price=65000,
)
```

---

# 12. Ejecución de tests

Los tests fueron ejecutados mediante los comandos definidos por el proyecto.

Service:

```bash
python -m app.tests.price_history_service_test
```

Controller:

```bash
python -m app.tests.price_history_controller_test
```

Resultado:

```text
[✓] Price History Service tests
[✓] Price History Controller tests
```

Todos los tests pasaron correctamente.

---

# 13. Prueba mediante Swagger

La API también fue probada mediante Swagger:

```text
http://127.0.0.1:8000/docs
```

Se realizó una consulta:

```text
GET /coins/bitcoin/price-history
```

La API respondió correctamente con registros históricos.

Ejemplo:

```json
[
  {
    "id": 1,
    "coin_id": "bitcoin",
    "price": 60000,
    "recorded_at": "2026-08-07T11:52:29"
  },
  {
    "id": 2,
    "coin_id": "bitcoin",
    "price": 64930,
    "recorded_at": "2026-08-07T21:35:42"
  }
]
```

La consulta fue validada correctamente desde Swagger.

---

# 14. Errores revisados

Durante la revisión se verificaron especialmente:

- nombres consistentes entre Controller y Service;
- nombres consistentes entre Service y Repository;
- construcción correcta del SQL;
- posición de `ORDER BY`;
- parámetros SQL;
- conversión de fechas;
- validación de rangos;
- interacción entre capas.

No quedaron errores de tests pendientes.

Por este motivo no fue necesario crear:

```text
errors_tests/
```

---

# 15. Buenas prácticas aplicadas

## Separación de responsabilidades

Cada capa mantiene una responsabilidad clara:

```text
Controller
→ coordinación

Service
→ reglas de negocio

Repository
→ persistencia

FastAPI
→ HTTP
```

---

## SQL parametrizado

Los valores externos se pasan mediante parámetros:

```python
cursor.execute(query, params)
```

---

## Filtros opcionales

Los filtros no son obligatorios.

Esto permite utilizar el mismo endpoint para múltiples tipos de consulta.

---

## Validación en Service

Las reglas:

```text
start_date <= end_date
```

y:

```text
min_price <= max_price
```

se mantienen fuera del Controller y del Repository.

---

# 16. Archivos relacionados

Los principales archivos utilizados durante el módulo fueron:

```text
app/
├── api/
│   └── app.py
│
├── controllers/
│   └── price_history_controller.py
│
├── repositories/
│   └── price_history_repository.py
│
├── services/
│   └── price_history_service.py
│
└── tests/
    ├── price_history_service_test.py
    └── price_history_controller_test.py
```

---

# 17. Estado final

El sistema permite consultar el historial de precios utilizando:

```text
coin_id
start_date
end_date
min_price
max_price
```

Los filtros pueden utilizarse:

```text
individualmente
```

o:

```text
combinados
```

El flujo completo es:

```text
HTTP
 ↓
FastAPI
 ↓
Controller
 ↓
Service
 ├── Validación
 ├── Conversión de fechas
 ↓
Repository
 ├── Construcción SQL
 ├── Parámetros
 ↓
MySQL
```

---

# 18. Checklist

```text
[✓] Conceptos explicados
[✓] Arquitectura definida
[✓] Filtros implementados
[✓] Validación de fechas
[✓] Validación de precios
[✓] Conversión date → datetime
[✓] Repository integrado
[✓] SQL parametrizado
[✓] Combinación de filtros
[✓] Tests del Service
[✓] Tests del Controller
[✓] Tests ejecutados
[✓] Todos los tests pasan
[✓] API probada mediante Swagger
[✓] Errores revisados
[✓] Sin errores pendientes
```

---

# 19. Conocimientos adquiridos

Al finalizar el Módulo 42, se incorporaron conceptos importantes para construir APIs REST más flexibles:

```text
Query Parameters
       ↓
Filtros opcionales
       ↓
Validación
       ↓
Service Layer
       ↓
Consultas SQL dinámicas
       ↓
SQL parametrizado
       ↓
Repository Pattern
       ↓
Tests unitarios
```

El siguiente paso será continuar ampliando las capacidades de consulta de `Price History`, introduciendo progresivamente nuevas funcionalidades sin romper la arquitectura existente.
