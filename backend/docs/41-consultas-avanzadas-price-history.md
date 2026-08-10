# Módulo 41 — Consultas avanzadas de Price History

> **Estado:** TERMINADO
> **Proyecto:** Crypto Tracker — Backend
> **Fase:** Fase 1 — Data & API
> **Módulo anterior:** Módulo 40 — Price History
> **Módulo siguiente:** Módulo 42 — Filtros de Price History

---

## 1. Objetivo

El objetivo del Módulo 41 fue evolucionar el endpoint básico de consulta de historial de precios para permitir realizar **consultas por rango de fechas**.

Anteriormente, el endpoint permitía obtener todo el historial de una criptomoneda:

```http
GET /coins/{coin_id}/price-history
```

En este módulo se incorporaron parámetros opcionales:

```text
start_date
end_date
```

permitiendo realizar consultas como:

```http
GET /coins/bitcoin/price-history?start_date=2026-08-08
```

o:

```http
GET /coins/bitcoin/price-history?start_date=2026-08-07&end_date=2026-08-08
```

---

# 2. Conceptos aprendidos

Durante este módulo se trabajó con:

- Query Parameters en FastAPI.
- Parámetros opcionales.
- `date` y `datetime` en Python.
- Conversión de `date` a `datetime`.
- `datetime.combine()`.
- `time.min`.
- `time.max`.
- Consultas SQL dinámicas.
- Filtros mediante `WHERE`.
- SQL parametrizado.
- Rangos de fechas.
- `ORDER BY`.
- Validación de rangos.
- Separación de responsabilidades entre Controller, Service y Repository.
- Testing de casos con y sin filtros.
- Testing manual mediante Swagger.

---

# 3. Arquitectura

La arquitectura utilizada continúa siendo:

```text
                    ┌───────────────┐
                    │    Swagger    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    FastAPI    │
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
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Repository   │
                    └───────┬───────┘
                            │
                            ▼
                         MySQL
```

El Controller se ocupa de la capa HTTP.

El Service contiene la lógica de negocio.

El Repository se ocupa de construir y ejecutar las consultas contra MySQL.

---

# 4. Funcionalidad implementada

El endpoint:

```http
GET /coins/{coin_id}/price-history
```

ahora permite:

### Sin filtros

```http
GET /coins/bitcoin/price-history
```

Obtiene todo el historial.

### Solo fecha inicial

```http
GET /coins/bitcoin/price-history?start_date=2026-08-08
```

Obtiene registros desde esa fecha.

### Solo fecha final

```http
GET /coins/bitcoin/price-history?end_date=2026-08-07
```

Obtiene registros hasta esa fecha.

### Rango completo

```http
GET /coins/bitcoin/price-history?start_date=2026-08-07&end_date=2026-08-08
```

Obtiene los registros comprendidos dentro del rango.

---

# 5. Manejo de fechas

Uno de los conceptos importantes del módulo fue diferenciar:

```python
date
```

de:

```python
datetime
```

El parámetro recibido por la API representa solamente una fecha:

```text
2026-08-07
```

pero los registros de `price_history` contienen fecha y hora:

```text
2026-08-07 21:35:42
```

Por eso se realiza una conversión.

Para una fecha inicial:

```text
2026-08-07
```

se utiliza:

```text
2026-08-07 00:00:00
```

Para una fecha final:

```text
2026-08-07
```

se utiliza:

```text
2026-08-07 23:59:59.999999
```

Esto permite que:

```http
end_date=2026-08-07
```

incluya todos los registros del día 7.

---

# 6. Importancia de `time.max`

Una implementación incorrecta podría interpretar:

```text
2026-08-07
```

como:

```text
2026-08-07 00:00:00
```

Esto provocaría que registros posteriores del mismo día quedaran fuera.

Por ejemplo:

```text
2026-08-07 11:52:29
2026-08-07 21:35:42
2026-08-07 21:36:09
```

Por eso el límite superior se transforma en:

```text
2026-08-07 23:59:59.999999
```

De esta manera el día completo queda incluido.

---

# 7. Validación del rango

Cuando se proporcionan ambas fechas:

```text
start_date
end_date
```

el rango debe ser válido.

Conceptualmente:

```python
start_date <= end_date
```

Un rango como:

```text
start_date = 2026-08-08
end_date = 2026-08-07
```

no es válido.

La aplicación debe rechazar este tipo de consulta en lugar de realizar una consulta inconsistente contra la base de datos.

---

# 8. Repository

La responsabilidad del Repository continúa siendo acceder a los datos.

La consulta debe utilizar parámetros SQL en lugar de concatenar directamente valores recibidos desde la API.

Conceptualmente:

```sql
SELECT
    id,
    coin_id,
    price,
    recorded_at
FROM price_history
WHERE coin_id = %s
ORDER BY recorded_at ASC;
```

Cuando existen filtros se incorporan las condiciones correspondientes.

Por ejemplo:

```sql
WHERE coin_id = %s
AND recorded_at >= %s
AND recorded_at <= %s
```

Los valores se proporcionan como parámetros separados.

Esto evita construir SQL mediante concatenación de strings y reduce riesgos de SQL Injection.

---

# 9. Ordenamiento

El historial se devuelve mediante:

```sql
ORDER BY recorded_at ASC
```

Por lo tanto, los registros aparecen desde el más antiguo hasta el más reciente.

Ejemplo:

```text
2026-08-07 11:52:29
2026-08-07 21:35:42
2026-08-07 21:36:09
2026-08-07 21:36:12
2026-08-07 21:37:17
2026-08-07 21:40:35
2026-08-08 19:22:18
2026-08-08 19:23:02
```

---

# 10. Datos utilizados durante la prueba

Durante la prueba manual mediante Swagger se obtuvo correctamente el historial de Bitcoin.

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
  },
  {
    "id": 3,
    "coin_id": "bitcoin",
    "price": 64930,
    "recorded_at": "2026-08-07T21:36:09"
  },
  {
    "id": 4,
    "coin_id": "bitcoin",
    "price": 64930,
    "recorded_at": "2026-08-07T21:36:12"
  },
  {
    "id": 5,
    "coin_id": "bitcoin",
    "price": 64920,
    "recorded_at": "2026-08-07T21:37:17"
  },
  {
    "id": 6,
    "coin_id": "bitcoin",
    "price": 64960,
    "recorded_at": "2026-08-07T21:40:35"
  },
  {
    "id": 7,
    "coin_id": "bitcoin",
    "price": 65064,
    "recorded_at": "2026-08-08T19:22:18"
  },
  {
    "id": 8,
    "coin_id": "bitcoin",
    "price": 65064,
    "recorded_at": "2026-08-08T19:23:02"
  }
]
```

---

# 11. Pruebas realizadas mediante Swagger

Se probaron correctamente las siguientes consultas.

## 11.1 Sin filtros

```http
GET /coins/bitcoin/price-history
```

Resultado:

```text
8 registros
```

---

## 11.2 Solo `start_date`

```http
GET /coins/bitcoin/price-history?start_date=2026-08-08
```

Resultado esperado y obtenido:

```text
id 7
id 8
```

---

## 11.3 Solo `end_date`

```http
GET /coins/bitcoin/price-history?end_date=2026-08-07
```

Resultado esperado y obtenido:

```text
id 1
id 2
id 3
id 4
id 5
id 6
```

---

## 11.4 Mismo día como rango

```http
GET /coins/bitcoin/price-history?start_date=2026-08-07&end_date=2026-08-07
```

Resultado esperado y obtenido:

```text
id 1
id 2
id 3
id 4
id 5
id 6
```

Esto confirma que el día completo se incluye correctamente.

---

## 11.5 Rango de dos días

```http
GET /coins/bitcoin/price-history?start_date=2026-08-07&end_date=2026-08-08
```

Resultado:

```text
8 registros
```

---

# 12. Testing

Se mantienen los tests correspondientes a las capas de:

```text
PriceHistoryService
PriceHistoryController
```

Se cubrieron los escenarios relevantes para la funcionalidad:

- consulta sin filtros;
- consulta con fecha inicial;
- consulta con fecha final;
- consulta con ambas fechas;
- validación de rango;
- comportamiento esperado del Controller;
- comportamiento esperado del Service.

Los tests del módulo forman parte de la implementación y deben ejecutarse antes de considerar terminado el módulo.

---

# 13. Testing manual de la API

La API se ejecuta mediante:

```bash
uvicorn app.api.app:app --reload
```

Swagger está disponible en:

```text
http://127.0.0.1:8000/docs
```

Desde Swagger se probó:

```text
GET /coins/{coin_id}/price-history
```

utilizando:

```text
coin_id = bitcoin
```

y diferentes combinaciones de:

```text
start_date
end_date
```

Todas las pruebas funcionales realizadas respondieron correctamente.

---

# 14. Errores comunes

### Fecha final excluyendo registros

Incorrecto:

```text
2026-08-07 00:00:00
```

como límite superior.

Correcto:

```text
2026-08-07 23:59:59.999999
```

---

### Concatenar valores directamente en SQL

Evitar:

```python
query = f"SELECT * FROM price_history WHERE coin_id = '{coin_id}'"
```

Utilizar consultas parametrizadas.

---

### Colocar SQL en el Controller

El Controller no debe conocer detalles de MySQL.

Incorrecto:

```text
Controller
    ↓
SQL
```

Correcto:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
MySQL
```

---

### Colocar lógica de negocio en FastAPI

El endpoint debe ocuparse principalmente de:

- recibir parámetros;
- delegar;
- transformar el resultado en respuesta HTTP.

La lógica de negocio debe permanecer en el Service.

---

# 15. Buenas prácticas aplicadas

Durante el módulo se aplicaron:

- separación de responsabilidades;
- Repository Pattern;
- Service Layer;
- Controller Layer;
- consultas SQL parametrizadas;
- validación de datos;
- parámetros opcionales;
- ordenamiento explícito;
- manejo correcto de fechas;
- reutilización de la arquitectura existente;
- testing por capas;
- pruebas manuales mediante Swagger.

---

# 16. Conceptos de Backend Profesional

Este módulo introduce un concepto importante:

> Una API profesional no solamente devuelve datos; permite consultar los recursos de manera flexible y predecible.

El endpoint pasó de:

```http
GET /coins/bitcoin/price-history
```

a permitir:

```http
GET /coins/bitcoin/price-history?start_date=...
```

Esto representa el comienzo de una API orientada a consultas más avanzadas.

La evolución natural será:

```text
Historial completo
       ↓
Filtros
       ↓
Paginación
       ↓
Ordenamiento
       ↓
Estadísticas
       ↓
Agregaciones
       ↓
Variaciones
```

---

# 17. Estado de la arquitectura

La arquitectura actual queda:

```text
FastAPI
   │
   ▼
PriceHistoryController
   │
   │  start_date
   │  end_date
   ▼
PriceHistoryService
   │
   │  validación
   │  transformación
   ▼
PriceHistoryRepository
   │
   │  SQL parametrizado
   │  WHERE
   │  ORDER BY
   ▼
MySQL
```

---

# 18. Próximos pasos

El próximo módulo continuará evolucionando `Price History`.

La dirección de la Fase 1 es:

```text
Módulo 40
Price History
      ✓
      │
      ▼
Módulo 41
Consultas por rango de fechas
      ✓
      │
      ▼
Módulo 42
Filtros de Price History
      │
      ▼
Módulo 43
Paginación
      │
      ▼
Módulo 44
Ordenamiento
      │
      ▼
Módulo 45
Estadísticas
      │
      ▼
Módulo 46
Variaciones
      │
      ▼
Módulo 47
Agregaciones temporales
```

Los siguientes módulos se adaptarán al estado real del proyecto y no se introducirán funcionalidades innecesarias antes de que exista una necesidad técnica.

---

# 19. Resumen

En el Módulo 41 se evolucionó el endpoint de `Price History` para soportar consultas por fecha.

Se aprendió a:

```text
recibir Query Parameters
        ↓
validar fechas
        ↓
convertir date → datetime
        ↓
construir filtros
        ↓
ejecutar SQL parametrizado
        ↓
ordenar resultados
        ↓
devolver respuesta mediante FastAPI
```

La funcionalidad fue implementada respetando la arquitectura existente.

Además, se verificó el comportamiento real de la API utilizando Swagger.

---

# 20. Checklist

```text
[✓] Concepto explicado
[✓] Arquitectura definida
[✓] Query Parameters implementados
[✓] start_date implementado
[✓] end_date implementado
[✓] Conversión date → datetime
[✓] Inclusión del día completo
[✓] Validación del rango
[✓] SQL parametrizado
[✓] ORDER BY implementado
[✓] Integración con Repository
[✓] Integración con Service
[✓] Integración con Controller
[✓] Tests creados
[✓] Tests correspondientes revisados
[✓] API ejecutada
[✓] Swagger probado
[✓] start_date probado
[✓] end_date probado
[✓] Rango probado
[✓] Errores comunes revisados
[✓] Buenas prácticas explicadas
```

---

# 21. Estado final

```text
┌──────────────────────────────────────┐
│       MÓDULO 41 — COMPLETADO        │
├──────────────────────────────────────┤
│ Price History Queries                │
│                                      │
│ Query Parameters          ✓          │
│ Date Filtering            ✓          │
│ Range Validation           ✓          │
│ SQL Filtering              ✓          │
│ Ordering                   ✓          │
│ Service Layer              ✓          │
│ Repository Pattern         ✓          │
│ Controller                 ✓          │
│ Testing                    ✓          │
│ Swagger Verification       ✓          │
└──────────────────────────────────────┘
```

**Módulo 41 — TERMINADO.**
