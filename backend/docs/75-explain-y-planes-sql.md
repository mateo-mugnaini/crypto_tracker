# Módulo 75 — EXPLAIN y planes de ejecución SQL

> **Estado:** IMPLEMENTADO Y VERIFICADO EN LA BASE DE INTEGRACIÓN  
> **Proyecto:** Crypto Tracker  
> **Capa:** Repositories / MySQL / Performance  
> **Módulo anterior:** 74 — Índices y claves  
> **Siguiente módulo:** medición de rendimiento y migraciones controladas

## 1. Objetivo

Un índice recomendado debe validarse contra el plan que el optimizador de MySQL realmente elige. Este módulo incorpora `EXPLAIN` sobre las consultas más relevantes de Price History y Coins.

La pregunta no es únicamente:

```text
¿existe el índice?
```

También debe responderse:

```text
¿MySQL lo considera posible?
¿lo eligió para esta consulta?
¿cuántas filas estima examinar?
¿necesita ordenar o crear una tabla temporal?
```

## 2. Qué es EXPLAIN

`EXPLAIN` muestra el plan estimado para ejecutar una consulta. No ejecuta el `SELECT` como una consulta normal ni mide por sí mismo el tiempo real de respuesta.

Las columnas más útiles del formato clásico son:

| Columna | Significado |
| --- | --- |
| `table` | Tabla examinada. |
| `type` | Tipo de acceso, por ejemplo `const`, `ref`, `range` o `ALL`. |
| `possible_keys` | Índices que podrían ayudar a localizar filas. Puede ser `NULL` cuando solo existe un ordenamiento sin filtro. |
| `key` | Índice elegido finalmente por MySQL. |
| `key_len` | Longitud de la parte del índice utilizada. |
| `rows` | Estimación de filas que MySQL examinará. |
| `filtered` | Porcentaje estimado que sobrevivirá al filtro. |
| `Extra` | Detalles como `Using where`, `Using index` o `Using filesort`. |

Un `type = ALL` puede indicar un recorrido completo, pero no siempre es un problema: en una tabla muy pequeña puede ser más barato que recorrer un índice. Tampoco debe considerarse que `Using filesort` sea automáticamente un error; debe evaluarse junto con el tamaño de la tabla y la latencia observada.

## 3. Consultas analizadas

### Price History por fecha

```sql
SELECT id, coin_id, price, recorded_at
FROM price_history
WHERE coin_id = %s
  AND recorded_at >= %s
  AND recorded_at <= %s
ORDER BY recorded_at ASC, id ASC
LIMIT 20;
```

Índice esperado:

```text
idx_price_history_coin_recorded_at
(coin_id, recorded_at, id)
```

El plan verificado selecciona este índice. La igualdad por `coin_id` aparece primero, seguida por el rango y el orden temporal.

### Price History por precio

```sql
SELECT id, coin_id, price, recorded_at
FROM price_history
WHERE coin_id = %s
  AND price >= %s
  AND price <= %s
ORDER BY price DESC, id ASC
LIMIT 20;
```

Índice esperado:

```text
idx_price_history_coin_price
(coin_id, price, id)
```

El plan verificado también selecciona este índice. El índice ayuda a localizar el rango de precios después de filtrar por moneda. El orden mixto `price DESC, id ASC` puede seguir requiriendo trabajo adicional de ordenamiento según la versión y el plan de MySQL.

### Coins por ranking

```sql
SELECT *
FROM coins
ORDER BY market_cap_rank ASC;
```

Para el fixture de integración, que contiene pocas filas, MySQL elige un recorrido completo y `Using filesort`. Esto es una decisión válida del optimizador: leer una tabla pequeña y ordenar sus filas puede ser más barato que recorrer el índice.

Por este motivo el test no afirma ciegamente que el índice de ranking siempre será elegido. Registra y valida el plan observado, aceptando tanto el índice como el `filesort` cuando la tabla es pequeña.

## 4. Implementación en los tests

El archivo `app/tests/integration/test_price_history_integration.py` incorpora:

- `_explain()`, helper que ejecuta `EXPLAIN` con parámetros separados;
- un fixture con 500 observaciones deterministas de Price History;
- un test para el índice compuesto por fecha;
- un test para el índice compuesto por precio;
- un test para el plan de listado de Coins.

Los parámetros continúan separados del SQL. La interpolación de SQL se usa únicamente para anteponer la palabra fija `EXPLAIN`; no se construyen filtros a partir de input externo.

El fixture solo escribe en `MYSQL_TEST_DATABASE` y la limpieza existente elimina sus filas al terminar cada test. La base normal de la aplicación no se modifica.

## 5. Evidencia obtenida

Con el entorno MySQL de integración actual:

| Consulta | Resultado observado |
| --- | --- |
| Price History por fecha | `key = idx_price_history_coin_recorded_at` |
| Price History por precio | `key = idx_price_history_coin_price` |
| Coins por ranking | `key = NULL` y `Using filesort` con tabla pequeña |

La conclusión correcta es limitada: los índices de Price History son utilizados en este escenario de prueba. No significa que todas las consultas futuras, todos los tamaños de tabla o todas las versiones de MySQL produzcan exactamente el mismo plan.

## 6. Verificación manual

Desde un cliente MySQL conectado a la base correspondiente pueden ejecutarse consultas equivalentes:

```sql
EXPLAIN
SELECT id, coin_id, price, recorded_at
FROM price_history
WHERE coin_id = 'bitcoin'
  AND recorded_at >= '2026-01-01 00:00:00'
  AND recorded_at <= '2026-01-31 23:59:59'
ORDER BY recorded_at ASC, id ASC
LIMIT 20;
```

```sql
SHOW INDEX FROM price_history;
SHOW CREATE TABLE price_history;
```

Para análisis más profundos, la versión instalada de MySQL puede ofrecer formatos adicionales de `EXPLAIN`. Deben comprobarse en el entorno real antes de incluirlos en automatizaciones.

## 7. EXPLAIN no sustituye a una medición

`EXPLAIN` trabaja con estimaciones. Una revisión de rendimiento completa también debe considerar:

- cantidad real de filas;
- distribución de valores y selectividad;
- estadísticas actualizadas;
- latencia medida en condiciones representativas;
- memoria, disco y concurrencia;
- coste de mantener índices durante `INSERT`, `UPDATE` y `DELETE`.

No conviene optimizar una consulta solo porque aparece `Using filesort`, ni agregar índices sin comparar el coste antes y después.

## 8. Tests y comandos

Test específico:

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/integration/test_price_history_integration.py -q
```

Suite completa:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

La integración requiere `MYSQL_TEST_DATABASE` y permisos para crear tablas, insertar datos y ejecutar `EXPLAIN` en la base de testing.

Resultado de la verificación específica:

```text
6 passed, 1 warning
```

La advertencia corresponde a la compatibilidad de `TestClient` con la versión instalada de `httpx`; no está relacionada con los planes SQL.

## 9. Errores comunes

- Confundir `possible_keys` con el índice elegido: la columna importante para esa decisión es `key`.
- Interpretar `type = ALL` como fallo automático sin considerar el tamaño de la tabla.
- Suponer que un índice evita siempre `filesort`.
- Probar con una tabla vacía y extraer conclusiones de producción.
- Usar datos de producción dentro de tests automatizados.
- Construir SQL con valores externos para ejecutar `EXPLAIN`.
- Medir solo el plan y no la latencia ni el coste de escritura.
- Agregar índices sin revisar redundancias y estadísticas.

## 10. Checklist

- [x] Consultas reales de repositories identificadas.
- [x] Helper de `EXPLAIN` agregado al test de integración.
- [x] Dataset controlado para evitar planes triviales en Price History.
- [x] Índice temporal observado como `key` elegido.
- [x] Índice por precio observado como `key` elegido.
- [x] `filesort` de Coins documentado como decisión válida para tabla pequeña.
- [x] No se modificó la base principal.
- [x] Test específico ejecutado correctamente.

## 11. Estado final

M75 queda implementado y verificado en la base de integración. El backend ya no solo declara índices: también comprueba, mediante `EXPLAIN`, cómo los utiliza MySQL en consultas representativas.

El siguiente paso natural es medir latencia con datos más representativos y definir un mecanismo de migraciones controladas antes de aplicar cambios de índices a la base normal.
