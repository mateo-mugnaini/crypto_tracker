# Modulo 41 - Consultas avanzadas de `PriceHistory`

El objetivo de este modulo no sera crear otra funcionalidad aislada, sino evolucionar el `Price History` que ya tenemos para que deje de ser solamente

```
GET - /coins/{coin_id}/price-history
```

y empiece a comportarse como una **consulta real de datos historicos**

### 1. Objetivo

Al finalizar el modulo podremos consultar el historico de una moneda aplicando un rango temporal.

```text
GET - /coins/{coin_id}/price-history?start_date=2026-08-01&end_date=2026-08-09
```

El flujo sera:

```text
HTTP Request
↓
FastAPI
↓
Controller
↓
Service
↓
Repository
↓
MySQL

Y aprenderemos a separar correctamente:
HTTP
↓
Reglas de negocio
↓
Persistencia
```

## 2. Qué vamos a aprender?

- Query Parameters.
- `datetime` en Python.
- Filtros por rango de fechas.
- SQL WHERE.
- Operadores >= y <=.
- Consultas parametrizadas.
- Separacion Controller / Service / Repository.
- Filtros opcionales.
- Validacion basica.
- Ordenamientos temporales.
- Como evitar contruir SQL concatedando valores recibidos por HTTP.
- Test del Service.
- Test del Controller.
- Pruebas mediantes Swagger.

3. Situación actual

Tenemos algo parecido a:

CoinGecko
│
▼
PriceHistoryService
│
▼
PriceHistoryRepository
│
▼
MySQL

Y:

POST /coins/{coin_id}/price

guarda el precio actual.

Mientras que:

GET /coins/{coin_id}/price-history

obtiene los registros.

El problema es que actualmente la consulta no permite decir:

Dame solamente el historial de Bitcoin entre el 1 y el 9 de agosto.

Eso es exactamente lo que vamos a resolver.

4. El problema arquitectónico

Una implementación incorrecta sería poner SQL directamente en FastAPI:

@app.get("/coins/{coin_id}/price-history")
def get_history(coin_id):
cursor.execute(...)

Esto mezclaría:

HTTP

- SQL
- persistencia

en el mismo lugar.

No queremos eso.

Nuestra arquitectura seguirá siendo:

┌─────────────────────────┐
│ FastAPI │
│ │
│ Query Parameters │
└────────────┬────────────┘
│
▼
┌─────────────────────────┐
│ Controller │
│ │
│ HTTP → aplicación │
└────────────┬────────────┘
│
▼
┌─────────────────────────┐
│ Service │
│ │
│ reglas de negocio │
└────────────┬────────────┘
│
▼
┌─────────────────────────┐
│ Repository │
│ │
│ SQL / MySQL │
└────────────┬────────────┘
│
▼
MySQL 5. ¿Qué es una consulta avanzada?

No significa necesariamente una consulta SQL gigantesca.

Significa que el cliente puede expresar mejor qué información necesita.

Actualmente:

GET /coins/bitcoin/price-history

significa:

Dame todo.

Ahora tendremos:

GET /coins/bitcoin/price-history?start_date=2026-08-01

Dame desde esta fecha.

O:

GET /coins/bitcoin/price-history?end_date=2026-08-09

Dame hasta esta fecha.

O:

GET /coins/bitcoin/price-history?start_date=2026-08-01&end_date=2026-08-09

Dame solamente este intervalo.

Esto es un patrón extremadamente habitual en APIs REST.

6. Diseño de los parámetros

Utilizaremos:

start_date
end_date

Formato:

YYYY-MM-DD

Ejemplo:

2026-08-01

La API permitirá:

Request Resultado
sin parámetros todo el historial
start_date desde esa fecha
end_date hasta esa fecha
ambos intervalo

Esto es importante:

Los parámetros serán opcionales.

No vamos a crear cuatro endpoints diferentes.

Incorrecto:

GET /history
GET /history/from
GET /history/to
GET /history/range

Correcto:

GET /history?start_date=...&end_date=... 7. Flujo de datos

Supongamos:

GET /coins/bitcoin/price-history?start_date=2026-08-01&end_date=2026-08-09

FastAPI recibe:

coin_id = "bitcoin"

start_date = 2026-08-01

end_date = 2026-08-09

El Controller delega:

Controller
↓
Service.get_price_history(
coin_id,
start_date,
end_date
)

El Service delega:

Service
↓
Repository.get_by_coin_id_and_date_range(...)

Y el Repository construye conceptualmente:

SELECT ...
FROM price_history
WHERE coin_id = %s
AND recorded_at >= %s
AND recorded_at <= %s
ORDER BY recorded_at ASC; 8. ¿Por qué el filtro pertenece al Repository?

Porque el Repository es responsable de cómo obtenemos datos.

El Service sabe:

Necesito el historial de esta moneda en este período.

El Repository sabe:

Para conseguirlo tengo que ejecutar este SQL.

Esta distinción es fundamental.

Service
"Quiero historial de Bitcoin entre X e Y"

vs.

Repository
"SELECT ... WHERE ... " 9. ¿Por qué no construir SQL dinámicamente concatenando strings?

Nunca queremos algo como:

query = f"""
SELECT \*
FROM price_history
WHERE coin_id = '{coin_id}'
"""

Además de ser una mala práctica, abre la puerta a SQL Injection.

Queremos:

query = """
SELECT ...
FROM price_history
WHERE coin_id = %s
"""

y después:

cursor.execute(query, (coin_id,))

Los valores son parámetros separados de la sentencia SQL.

10. Archivos involucrados

En este módulo vamos a trabajar principalmente con:

app/
├── controllers/
│ └── price_history_controller.py
│
├── repositories/
│ └── price_history_repository.py
│
├── services/
│ └── price_history_service.py
│
└── tests/
├── price_history_service_test.py
└── price_history_controller_test.py

No necesitamos modificar:

models/price_history.py

porque el modelo ya representa correctamente un registro histórico.

Tampoco necesitamos modificar:

container.py

porque seguimos utilizando las mismas dependencias.

11. Model

El concepto sigue siendo:

PriceHistory(
id=None,
coin_id=coin_id,
price=price,
recorded_at=datetime.now()
)

No necesitamos agregar:

start_date
end_date

al modelo.

Esto es importante.

start_date y end_date no son propiedades de un PriceHistory.

Son parámetros de una consulta.

## 12. Repository

El Repository será el responsable de ejecutar la consulta filtrada.

La idea será tener un método:

get_by_coin_id_and_date_range()

con:

coin_id
start_date
end_date

Pero también necesitamos soportar filtros opcionales.

Por eso utilizaremos una consulta dinámica controlada.

No estamos construyendo SQL a partir de valores del usuario.

Estamos construyendo la estructura de la consulta y pasando los valores como parámetros.

---

`PRICE HISTORY REPOSITORY`:[ver codigo](../backend/app/repositories/price_history_repository.py)

El siguiente archivo representa la versión completa que debe quedar después del módulo. Mantiene la responsabilidad del Repository y agrega la consulta avanzada.

## Analicemos el codigo:

La parte mas importante es:

```py
parameters = [coin_id]
```

inicialmente nuestra consulta necesitaba

```SQL
WHERE coin_id = %s
```

por eso

```py
parameters = [coin_id]
```

despues,

```py
if start_date is not None
```

significa que si el `usuario` proporciono una fecha inicial, agregamos ese filtro.

Entonces:

```SQL
AND recorded_at >= %s
```

y agregamos:

```Python
parameters.append(start_date)
```

y lo mismo pasa con `end_date`

Finalmente :

```Python
cursor.execute(query, tuple(parameters))

# EJEMPLO CONCEPTUAL:
# query:
# WHERE coin_id = %s
# AND recorded_at >= %s
# AND recorded_at <= %s
# parameters:
# (
#     "bitcoin",
#     datetime(...),
#     datetime(...)
# )
```

El driver de MySQL se encarga de asociar los parámetros.

## ¿Por qué no tener tres métodos?

Podríamos hacer:

```py
get_all()
get_from_date()
get_until_date()
```

Pero empezaríamos a duplicar consultas.

Nuestro metodo permite:

- start_date = `None`
- end_date = `None`

---

- start_date = `valor`
- end_date = `valor`

---

- start_date = `None`
- end_date = `valor`

---

- start_date = `valor`
- end_date = `None`

---

## 13. Service

El service no necesita saber como se contruye el SQL.

**Su responsabilidad es `recibir` la peticion de negocio y delegar**

`price_history_service.py`: [ver codigo](../backend/app/services/price_history_service.py)

### ¿Qué cambio en el Service?

Antes teníamos conceptualmente:

```py
get_history(coin_id)
```

Ahora:

```py
get_history(
    coin_id,
    start_date,
    end_date
)
```

Para observa algo importante:

- El Service no ejecuta SQL
- No sabe si MySQL utiliza: `>= o <= o BETWEEN`

Eso pertenece al `Repository`

**El `SERVICE` simplemente expresa la operacion**

### 14. Controller

`price_history_controller.py`: [ver codigo](../backend/app/controllers/price_history_controller.py)

Aqui aparece una regla importante: el controller no decide como consultar MySQL.

Solo recibe:

- coin_id,
- start_date,
- end_date.

y delega.

---

## 14. FastAPI

Modificamos `app.py`

[Ver codigo](../backend/app/api/app.py)

La ruta seguira siendo:

```
GET - /coins/{coin_id}/price-history
```

como `Query Parameters`

**Por qué `date` en HTTP y `datetime` internamente**

Porque nuestra API está solicitando: 2026-08-09

Eso es conceptualmente una fecha.

Pero `recorded_at` contiene: 2026-08-09 15:34:21

Esp es un datetime.

Por eso convertimos:

```py
date
```

a

```py
datetime
```

antes de llegar al Repository
