# Módulo 43 — Consultas y validaciones avanzadas de Price History

> **Estado:** TERMINADO
> **Proyecto:** Crypto Tracker — Backend
> **Fase:** Data & API
> **Módulo:** 43

---

## 1. Objetivo

El objetivo del Módulo 43 fue continuar profesionalizando el acceso al historial de precios (`Price History`) incorporando consultas combinadas y validaciones de los parámetros recibidos.

La funcionalidad permite consultar el historial de una criptomoneda utilizando diferentes criterios:

- Fecha inicial.
- Fecha final.
- Precio mínimo.
- Precio máximo.
- Combinaciones entre filtros.

Además, se incorporaron validaciones para evitar rangos inválidos.

---

# 2. Conceptos aprendidos

Durante este módulo se trabajaron los siguientes conceptos:

- Validación de rangos.
- Parámetros opcionales.
- `date` vs `datetime`.
- Conversión de fechas.
- `datetime.combine()`.
- `time.min`.
- `time.max`.
- Consultas SQL dinámicas.
- Parámetros SQL.
- Consultas parametrizadas.
- Mocking mediante `unittest.mock`.
- `Mock(spec=...)`.
- `assert_called_once_with()`.
- `assert_not_called()`.
- Tests unitarios de Service.
- Tests unitarios de Controller.
- Separación de responsabilidades.

---

# 3. Arquitectura

La arquitectura utilizada continúa siendo:

```text
                    FastAPI
                       │
                       ▼
                  Controller
                       │
                       ▼
                    Service
                       │
                       ▼
                  Repository
                       │
                       ▼
                     MySQL
```

El flujo de una consulta de historial es:

```text
GET /coins/{coin_id}/price-history
             │
             ▼
        FastAPI / API
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

La responsabilidad de cada capa continúa siendo independiente.

### Controller

Se encarga de recibir los parámetros HTTP y delegar la operación.

### Service

Se encarga de las reglas de negocio y validaciones.

Por ejemplo:

```text
min_price <= max_price
```

y:

```text
start_date <= end_date
```

### Repository

Se encarga de construir y ejecutar la consulta SQL.

### MySQL

Es responsable de almacenar y recuperar los registros.

---

# 4. Filtros disponibles

El endpoint de historial permite utilizar:

```text
coin_id
start_date
end_date
min_price
max_price
```

Todos los filtros, excepto `coin_id`, son opcionales.

Por ejemplo:

```text
GET /coins/bitcoin/price-history
```

obtiene todo el historial.

Mientras que:

```text
GET /coins/bitcoin/price-history?min_price=64000
```

obtiene únicamente registros cuyo precio sea mayor o igual a `64000`.

---

# 5. Filtros de fecha

Cuando se proporciona:

```text
start_date=2026-08-07
```

la fecha se transforma en:

```text
2026-08-07 00:00:00
```

Esto permite incluir todos los registros desde el comienzo de ese día.

Cuando se proporciona:

```text
end_date=2026-08-08
```

se transforma en:

```text
2026-08-08 23:59:59.999999
```

De esta forma se incluye todo el día indicado.

La lógica utilizada es conceptualmente:

```text
start_date
    ↓
00:00:00

end_date
    ↓
23:59:59.999999
```

Esto evita perder registros almacenados durante el día.

---

# 6. Validación de rangos

Se incorporaron validaciones para impedir rangos incoherentes.

## Rango de fechas

No se permite:

```text
start_date > end_date
```

En ese caso se genera:

```python
ValueError(
    "start_date cannot be greater than end_date"
)
```

---

## Rango de precios

No se permite:

```text
min_price > max_price
```

En ese caso se genera:

```python
ValueError(
    "min_price cannot be greater than max_price"
)
```

Estas validaciones pertenecen al Service porque representan reglas de negocio y no lógica específica de HTTP.

---

# 7. Consultas SQL dinámicas

El Repository parte de una consulta base:

```sql
SELECT
    id,
    coin_id,
    price,
    recorded_at
FROM price_history
WHERE coin_id = %s
```

A partir de ahí se agregan condiciones dependiendo de los filtros recibidos.

Por ejemplo:

```text
min_price
```

agrega:

```sql
AND price >= %s
```

Mientras que:

```text
max_price
```

agrega:

```sql
AND price <= %s
```

Y las fechas agregan:

```sql
AND recorded_at >= %s
```

y:

```sql
AND recorded_at <= %s
```

Los valores se siguen pasando mediante parámetros SQL.

Esto es importante porque evita construir SQL concatenando directamente valores proporcionados por el usuario.

---

# 8. Ordenamiento

Los resultados continúan ordenándose cronológicamente:

```sql
ORDER BY recorded_at ASC
```

Por lo tanto, el resultado comienza por el registro más antiguo y termina con el más reciente.

Ejemplo:

```text
2026-08-07 11:52:29
2026-08-07 21:35:42
2026-08-08 19:22:18
2026-08-08 19:23:02
```

---

# 9. Tests del Service

Se implementaron tests para comprobar diferentes escenarios.

## Sin filtros

Se verifica que el Service delegue correctamente al Repository:

```text
coin_id
start_date=None
end_date=None
min_price=None
max_price=None
```

---

## Precio mínimo

Se verifica:

```text
min_price=64000
```

---

## Precio máximo

Se verifica:

```text
max_price=65000
```

---

## Rango de precios

Se verifica:

```text
min_price=64000
max_price=65000
```

---

## Rango inválido

Se comprueba que:

```text
min_price=65000
max_price=64000
```

produzca:

```text
ValueError
```

También se verifica que el Repository no sea llamado cuando la validación falla.

Esto es importante porque una entrada inválida no debería llegar a la capa de persistencia.

---

## Combinación de filtros

Se prueba simultáneamente:

```text
start_date
end_date
min_price
max_price
```

También se verifica que las fechas sean correctamente convertidas a `datetime`.

---

# 10. Tests del Controller

Los tests del Controller comprueban que los parámetros recibidos sean enviados correctamente al Service.

Se probaron:

- Consulta sin filtros.
- Consulta con filtros de precio.
- Consulta con todos los filtros.

El Controller no contiene lógica de negocio.

Su responsabilidad es delegar:

```text
Controller
    ↓
Service
```

---

# 11. Mocking

Para los tests unitarios se utilizó:

```python
Mock(spec=PriceHistoryRepository)
```

y:

```python
Mock(spec=PriceHistoryService)
```

El uso de `spec` permite que el Mock respete la interfaz del objeto original.

Por ejemplo:

```python
repository = Mock(
    spec=PriceHistoryRepository
)
```

Esto hace que el test esté más estrechamente relacionado con la estructura real del Repository.

---

# 12. Verificación de llamadas

Se utilizó:

```python
assert_called_once_with(...)
```

para comprobar que las dependencias recibieran exactamente los parámetros esperados.

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

Esto permite verificar no solamente el resultado sino también la interacción entre las capas.

---

# 13. Resultado de los tests

Los tests del módulo fueron ejecutados correctamente.

Resultado:

```text
ALL TESTS PASSED
```

Se verificaron tanto los tests correspondientes al Service como los correspondientes al Controller.

Por lo tanto:

```text
[✓] Service tests
[✓] Controller tests
[✓] Validaciones
[✓] Filtros
[✓] Combinación de filtros
[✓] Mocking
[✓] Delegación entre capas
```

---

# 14. Prueba mediante Swagger

El endpoint puede probarse desde:

```text
http://127.0.0.1:8000/docs
```

Endpoint:

```text
GET /coins/{coin_id}/price-history
```

Ejemplo:

```text
coin_id = bitcoin
```

Con filtros:

```text
start_date = 2026-08-07
end_date = 2026-08-08
min_price = 64000
max_price = 65000
```

La API debe devolver únicamente los registros que cumplan todas las condiciones.

---

# 15. Ejemplo de resultado

Un resultado válido puede tener esta estructura:

```json
[
  {
    "id": 1,
    "coin_id": "bitcoin",
    "price": 65000,
    "recorded_at": "2026-08-08T10:00:00"
  }
]
```

Los resultados dependen de los datos actualmente almacenados en MySQL.

---

# 16. Errores comunes

## `min_price` mayor que `max_price`

Ejemplo:

```text
min_price=65000
max_price=64000
```

Debe producir un error de validación.

---

## `start_date` posterior a `end_date`

Ejemplo:

```text
start_date=2026-08-10
end_date=2026-08-07
```

El rango es inválido.

---

## No convertir correctamente las fechas

Un error frecuente es tratar:

```text
2026-08-08
```

como si representara todo el día.

En realidad, cuando se convierte directamente a `datetime`, puede terminar representando:

```text
2026-08-08 00:00:00
```

Por eso `end_date` debe llevarse al final del día.

---

## Construir SQL concatenando valores

No se debe hacer:

```python
query += f"AND price >= {min_price}"
```

Se deben utilizar parámetros:

```python
query += "AND price >= %s"
params.append(min_price)
```

---

# 17. Buenas prácticas aplicadas

Durante este módulo se consolidaron varias buenas prácticas.

### Separación de responsabilidades

```text
Controller → HTTP
Service    → negocio
Repository → persistencia
```

### Validación antes de acceder a la DB

```text
Request
  ↓
Validation
  ↓
Repository
  ↓
MySQL
```

### SQL parametrizado

Los valores externos no se concatenan directamente en la consulta.

### Tests aislados

El Service se prueba utilizando un Repository simulado.

El Controller se prueba utilizando un Service simulado.

### Código reutilizable

Los filtros son opcionales y pueden combinarse.

---

# 18. Conceptos de backend profesional

Este módulo introduce una idea importante:

> Una consulta de backend normalmente necesita combinar múltiples criterios.

Un endpoint real difícilmente tendrá solamente:

```text
GET /price-history
```

Sin filtros.

Conforme crece una API aparecen necesidades como:

```text
filtrar
ordenar
paginar
buscar
agrupar
agregar
```

Por eso este módulo prepara la arquitectura para los siguientes pasos.

---

# 19. Evolución de Price History

La funcionalidad ha evolucionado de:

```text
Guardar precio
```

a:

```text
Guardar precio
      ↓
Consultar historial
      ↓
Filtrar por fecha
      ↓
Filtrar por precio
      ↓
Combinar filtros
      ↓
Validar rangos
```

Esto permite que el historial deje de ser simplemente una colección de registros y empiece a funcionar como un recurso consultable de una API REST real.

---

# 20. Estado final

El sistema permite consultar:

```text
                Price History
                     │
        ┌────────────┼────────────┐
        │            │            │
      Fecha        Precio       Combinado
        │            │            │
        ▼            ▼            ▼
    start/end    min/max     fecha + precio
```

La arquitectura continúa siendo:

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

# 21. Checklist

```text
[✓] Conceptos explicados
[✓] Arquitectura definida
[✓] Filtros implementados
[✓] Filtros de fecha implementados
[✓] Filtros de precio implementados
[✓] Combinación de filtros implementada
[✓] Validación de rangos implementada
[✓] Conversión date → datetime implementada
[✓] Consultas SQL parametrizadas
[✓] Tests del Service creados
[✓] Tests del Controller creados
[✓] Tests ejecutados
[✓] Todos los tests pasan
[✓] API probada mediante Swagger
[✓] Buenas prácticas revisadas
[✓] Documentación creada
```

---

# 22. Conclusión

El Módulo 43 consolida el sistema de consultas de `Price History` y prepara el proyecto para comenzar a trabajar con consultas más avanzadas.

El backend ya permite almacenar y consultar precios utilizando distintos criterios y combinaciones.

El siguiente paso natural será comenzar a trabajar con funcionalidades que permitan obtener información derivada del historial, como estadísticas, agregaciones y análisis de los precios.

**Módulo 43 — TERMINADO ✓**
