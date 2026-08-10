# Modulo 42 - Filtros avanzados de price history

## Objetivos

- Query Parameters opcionales.
- Filtros numéricos.
- `min_price`.
- `max_price`.
- Combinacion de multiples filtros.
- Construccion dinamica de SQL.
- Validacion de rangos numericos.
- Separacion de responsabilidades.
- Por que el Repository construye la consulta.
- Por que el Service valida reglas de negocio.
- SQL parametrizado.
- Test de multiples combinaciones.
- Testing mediante Swagger.

3. Situación actual

Después del Módulo 41 tenemos:

GET /coins/{coin_id}/price-history

con:

start_date
end_date

Por ejemplo:

GET /coins/bitcoin/price-history?start_date=2026-08-07&end_date=2026-08-08

Ahora agregaremos:

min_price
max_price

Por lo tanto, nuestro endpoint podrá recibir hasta cuatro filtros:

start_date
end_date
min_price
max_price 4. ¿Por qué necesitamos filtros por precio?

Imaginemos que Bitcoin tiene 10.000 registros históricos.

Queremos responder:

"Dame solamente los momentos donde Bitcoin estaba entre 64.000 y 65.000."

No tendría sentido:

traer los 10.000 registros desde MySQL;
enviarlos al Service;
filtrarlos en Python.

Sería mucho mejor que MySQL haga el trabajo:

WHERE price >= %s
AND price <= %s

Esto reduce:

datos transferidos;
memoria utilizada;
procesamiento en Python;
tiempo de respuesta.

La base de datos está diseñada precisamente para realizar este tipo de filtrado.

5. Arquitectura

Continuamos utilizando exactamente la arquitectura existente:

                    ┌───────────────┐
                    │    Swagger    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    FastAPI    │
                    └───────┬───────┘
                            │
                     Query Parameters
                            │
                            ▼
                    ┌───────────────┐
                    │  Controller   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Service    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Repository   │
                    └───────┬───────┘
                            │
                            ▼
                         MySQL

La responsabilidad de cada capa continúa siendo:

Controller

HTTP.

Recibe:

start_date
end_date
min_price
max_price

y delega.

Service

Reglas de negocio.

Por ejemplo:

min_price <= max_price
Repository

Persistencia.

Construye:

WHERE ...

y ejecuta SQL parametrizado.

6. ¿Dónde debe implementarse cada filtro?

Este punto es importante.

Podríamos cometer este error:

# Controller

if min_price:
...

No.

El Controller no debería conocer cómo se consulta MySQL.

Tampoco queremos:

# Service

for price_history in histories:
if price_history.price >= min_price:
...

Eso obligaría a traer todos los registros.

La solución correcta es:

Controller
│
│ recibe filtros
▼
Service
│
│ valida filtros
▼
Repository
│
│ convierte filtros en SQL
▼
MySQL 7. Nuevos filtros

Agregaremos:

min_price

Precio mínimo incluido.

Ejemplo:

GET /coins/bitcoin/price-history?min_price=65000

Conceptualmente:

WHERE price >= 65000
max_price

Precio máximo incluido.

Ejemplo:

GET /coins/bitcoin/price-history?max_price=65000

Conceptualmente:

WHERE price <= 65000
Ambos
GET /coins/bitcoin/price-history?min_price=64000&max_price=65000

Conceptualmente:

WHERE price >= 64000
AND price <= 65000 8. Archivos que modificaremos

La modificación principal estará en:

app/repositories/price_history_repository.py
app/services/price_history_service.py
app/controllers/price_history_controller.py

También revisaremos:

app/api/app.py

solamente si la definición actual del endpoint requiere modificación.

Los tests correspondientes serán:

app/tests/price_history_service_test.py
app/tests/price_history_controller_test.py

No necesitamos modificar MySQL.

La tabla price_history ya contiene:

id
coin_id
price
recorded_at

Por lo tanto, no necesitamos una migración.

9. Modelo de datos

Nuestro modelo continúa siendo conceptualmente:

class PriceHistory:

    def __init__(
        self,
        id,
        coin_id,
        price,
        recorded_at,
    ):
        self.id = id
        self.coin_id = coin_id
        self.price = price
        self.recorded_at = recorded_at

No necesitamos modificarlo.

¿Por qué?

Porque min_price y max_price no son propiedades de PriceHistory.

Son parámetros utilizados para consultar objetos PriceHistory.

Esta diferencia es importante.

10. Repository

El Repository necesita ser capaz de recibir todos los filtros.

La idea es evitar tener métodos como:

find_by_min_price()
find_by_max_price()
find_by_date()
find_by_date_and_price()
find_by_date_and_min_price()
find_by_date_and_max_price()
...

Eso produciría una explosión de métodos.

En su lugar tendremos una única consulta flexible.
