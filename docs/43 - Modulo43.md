# Módulo 43 — Paginación del Price History

## 1. Objetivo

Hasta ahora podemos consultar el historial:

```text
GET - /coins/bitcoin/price-history
```

y además aplicar filtros:

```text
GET /coins/bitcoin/price-history?min_price=64000&max_price=65000
```

El problema aparece cuando una criptomoneda tiene miles o millones de registros.

No sería correcto devolver todo:

- 10 registros
- 100 registros
- 10.000 registros
- 1.000.000 registros

en una sola respuesta.

En este módulo vamos a implementar paginación.

Por ejemplo:

```text
GET /coins/bitcoin/price-history?limit=20&offset=0
```

significa:

Dame los primeros 20 registros.

Mientras que:

```text
GET /coins/bitcoin/price-history?limit=20&offset=20
```

significa:

Dame los siguientes 20.

## 2. Qué vamos a aprender

En este módulo aprenderás:

- Qué es paginación.
- LIMIT.
- OFFSET.
- Paginación basada en páginas.
- Diferencia entre limit y offset.
- Cómo combinar paginación con filtros.
- Validación de parámetros.
- Cómo transportar estos parámetros por las distintas capas.
- Impacto de la paginación en SQL.
- Problemas de OFFSET.
- Por qué necesitamos un ORDER BY estable.
- Testing de paginación.

cómo evolucionará posteriormente hacia paginaciones más profesionales.

## 3. ¿Por qué necesitamos paginación?

Supongamos que tenemos:

100.000 registros
Sin paginación:

```sql
GET /coins/bitcoin/price-history
```

podría devolver:

```json
[
    {...},
    {...},
    {...},
    ...
]
```

con 100.000 objetos.

Esto provoca:

- más trabajo para MySQL;
- más memoria;
- mayor tiempo de consulta;
- mayor respuesta HTTP;
- mayor consumo de red;
- más trabajo para el cliente.

Con paginación:

```sql
GET /coins/bitcoin/price-history?limit=20&offset=0
```

solo solicitamos:

- 20 registros

## 4. Conceptos fundamentales

### LIMIT

```sql
LIMIT
-- Indica cuántos registros queremos obtener.
```

```sql
  LIMIT 20
-- significa:
-- Devuelve como máximo 20 registros.
```

### OFEFSET

```sql
OFFSET
-- Indica cuántos registros debemos saltarnos antes de comenzar a devolver resultados.
```

```sql
OFFSET 20
-- significa:
-- Salta los primeros 20 registros.
```

Por ejemplo:

Registros:

1 2 3 4 5 ... 20 21 22 23 ...

Con:

```sql
LIMIT 20 OFFSET 0
```

obtenemos:

1 → 20

Con:

```sql
LIMIT 20 OFFSET 20
```

obtenemos:

21 → 40

Con:

```sql
LIMIT 20 OFFSET 40
```

obtenemos:

41 → 60 5. Página vs Offset

---

Una API normalmente puede hablar en términos de:

- page
- limit

pero SQL trabaja naturalmente con:

- LIMIT
- OFFSET

Por ejemplo:

page = 3
limit = 20

se transforma en: `offset = (page - 1) \* limit`

Por lo tanto:

(3 - 1) \* 20
= 40

---

SQL:

```sql
LIMIT 20 OFFSET 40
```

En este módulo vamos a trabajar directamente con:

- limit
- offset

porque es una forma más sencilla de introducir el concepto.

Más adelante podremos construir una abstracción basada en page.

## 6. Arquitectura

La arquitectura queda:

```
     HTTP
       │
       ▼
┌───────────────┐
│    FastAPI    │
│               │
│ limit         │
│ offset        │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Controller   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    Service    │
│               │
│ validación    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Repository   │
│               │
│ LIMIT         │
│ OFFSET        │
└───────┬───────┘
        │
        ▼
      MySQL
```

## 7. ¿Dónde pertenece la paginación?

Hay una distinción importante.

FastAPI puede validar que:

```sql
limit >= 1
offset >= 0
```

porque son restricciones del HTTP endpoint.

Pero el Repository es quien debe implementar:

```sql
LIMIT %s
OFFSET %s
```

El Service será responsable de transportar y validar la información dentro de la lógica de aplicación.

Por lo tanto:

`FastAPI` → recibe y valida

`Controller` → delega

`Service` → coordina y valida

`Repository` → ejecuta LIMIT/OFFSET 8. Archivos que modificaremos

Vamos a trabajar principalmente con:

```shell
app/
├── api/
│     └── app.py
│
├── controllers/
│     └── price_history_controller.py
│
├── services/
│     └── price_history_service.py
│
├── repositories/
│     └── price_history_repository.py
│
└── tests/
      ├── price_history_service_test.py
      └── price_history_controller_test.py
```

No necesitamos crear una tabla nueva.

No necesitamos modificar el modelo PriceHistory.

## 9. Implementación

### 9.1 Repository

Actualmente el Repository ya recibe:

- coin_id
- start_date
- end_date
- min_price
- max_price

Ahora agregaremos:

- limit
- offset

La consulta terminará conceptualmente así:

```sql
WHERE ...
ORDER BY recorded_at ASC
LIMIT %s
OFFSET %s
-- Importante: ORDER BY
```

La paginación necesita un orden determinista.

Tenemos:

- ORDER BY recorded_at ASC

Pero dos registros pueden tener exactamente el mismo recorded_at.

Por eso es mejor utilizar un segundo criterio estable:

- ORDER BY recorded_at ASC, id ASC

Esto significa:

- ordenar por fecha;
- si dos registros tienen la misma fecha, ordenar por id.

Esto hace que las páginas sean más deterministas.

## 10. `price_history_repository.py`

Archivo: [ver codigo](../backend/app/repositories/price_history_repository.py)

### ¿Por qué limit puede ser None?

Tenemos:

```py
limit: int | None = None
```

Esto permite mantener el comportamiento anterior si llamamos al Repository sin paginación.

Por ejemplo:

```py
repository.find_by_coin_id(
coin_id="bitcoin",
)
```

no agregaría:

```py
LIMIT
OFFSET
```

Esto nos permite evolucionar la funcionalidad sin romper automáticamente código anterior.

Sin embargo, desde la API vamos a establecer un límite por defecto.

### ¿Por qué offset comienza en 0?

Porque representa registros que debemos saltar.

offset = 0

significa:

No te saltes ningún registro.

offset = 20

significa:

Salta los primeros 20.

Por eso:

offset: int = 0

es un valor natural.

## 11. Service

Ahora debemos transportar estos parámetros desde Controller hasta Repository.

El Service también debe garantizar que:

limit > 0
offset >= 0

aunque FastAPI ya pueda validarlo.

Esto es importante porque el Service no debería asumir que siempre será llamado desde FastAPI.

Podría ser utilizado posteriormente por:

- otro Controller.
- un job.
- un test.
- un comando CLI.
- otro servicio.

### 11.1 `price_history_service.py`

Archivo: [ver codigo](../backend/app/services/price_history_service.py)

### Una decisión importante

Observa que seguimos utilizando:

```py
start_date: date | None
end_date: date | None
```

en el Service.

El Service se encarga de convertir: `date`

a: `datetime`

Esto mantiene la responsabilidad que establecimos en el módulo anterior.

La API recibe una fecha.

El Service la convierte en un intervalo temporal.

El Repository solamente recibe datetime.

## 12. Controller

### 12.1 `price_history_controller.py`

Archivo: [ver codigo](../backend/app/controllers/price_history_controller.py)

## 13. FastAPI

### 13.1 app/api/app.py

Archivo: [ver codigo](../backend/app/api/app.py)

Importante

El endpoint ya no necesita:

```py
start_datetime = None

# ni:

datetime.combine(...)
```

porque esa responsabilidad está en el Service.

Por lo tanto, tampoco necesitamos:

```py
from datetime import datetime, time
```

si no son utilizados por ninguna otra parte de app.py.

## 14. Primera consulta

Con el endpoint:

```sql
GET /coins/bitcoin/price-history
```

FastAPI utilizará:

```sql
limit = 20
offset = 0
```

Por lo tanto:

```sql
LIMIT 20 OFFSET 0 20. Segunda página
```

Para obtener los siguientes 20:

```sql
GET /coins/bitcoin/price-history?limit=20&offset=20
```

SQL:

```sql
--  Tercera página
LIMIT 20 OFFSET 20 21.
GET /coins/bitcoin/price-history?limit=20&offset=40
```

SQL:

```sql
-- Paginación + filtros
LIMIT 20 OFFSET 40 22.
```

Una de las partes más importantes de este módulo es que la paginación debe funcionar junto con los filtros anteriores.

Por ejemplo:

```sql
GET /coins/bitcoin/price-history?min_price=64000&max_price=65000&limit=10&offset=0
```

El flujo será:

```text
coin_id + price filters + pagination
↓
Repository
↓
MySQL
```

La consulta será conceptualmente:

```sql
SELECT
id,
coin_id,
price,
recorded_at
FROM price_history
WHERE coin_id = %s
AND price >= %s
AND price <= %s
ORDER BY recorded_at ASC, id ASC
LIMIT %s
OFFSET %s
```

Esto es importante:

Primero se filtran los resultados y después se aplica la paginación.
