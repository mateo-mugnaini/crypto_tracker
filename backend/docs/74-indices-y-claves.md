# Módulo 74 — Índices y claves para consultas frecuentes

> **Estado:** IMPLEMENTADO EN EL ESQUEMA DE INTEGRACIÓN Y DOCUMENTADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Base de datos / Performance  
> **Módulo anterior:** 73 — Auditoría general de seguridad  
> **Siguiente módulo:** 75 — Análisis de consultas SQL

## 1. Objetivo

Aprender a identificar índices a partir de las consultas reales del backend y distinguir entre:

- claves que ya existen por el modelo lógico;
- índices que conviene aplicar por los patrones actuales;
- índices que serían prematuros o redundantes;
- cambios que no deben ejecutarse automáticamente mientras no exista un sistema de migraciones.

Este módulo no inventa un esquema nuevo. Usa las queries actuales de los repositories y aplica los índices nuevos únicamente al esquema de integración, donde la creación es idempotente y verificable.

## 2. Estado previo

El código tenía estas evidencias:

- `coins.id` se usa como clave de búsqueda y `ON DUPLICATE KEY`.
- `coins` se lista ordenando por `market_cap_rank`.
- `favorites` se consulta por `user_id`, por `(user_id, coin_id)` y mediante join con `coins.id`.
- `users` se consulta por `id` y `email`.
- `price_history` se consulta siempre por `coin_id` y frecuentemente por `recorded_at`.
- algunas consultas ordenan por `price` y aplican min/max.
- el repository de Price History calcula primero/último registro y agrupa temporalmente.

No existía un DDL normal ni una migración versionada que permitiera verificar todos los índices de la base principal. El test de integración sí crea las tablas `coins` y `price_history`, por lo que ese esquema es el lugar seguro para implementar y comprobar los índices de este módulo.

## 3. Qué es un índice

Un índice es una estructura auxiliar que permite localizar filas sin recorrer toda la tabla. La analogía más cercana es el índice de un libro: ocupa espacio y debe mantenerse cuando se insertan/actualizan filas, pero acelera búsquedas selectivas.

```text
Sin índice:
SELECT ... FROM price_history WHERE coin_id = 'bitcoin'
        └── posible recorrido completo de la tabla

Con índice (coin_id, recorded_at):
        └── búsqueda por coin_id y recorrido ordenado por fecha
```

Un índice no hace automáticamente rápida cualquier consulta. Su utilidad depende del orden de las columnas, la selectividad, el filtro, el ordenamiento y el plan elegido por MySQL.

## 4. Claves e índices actuales

| Tabla | Clave/índice | Estado confirmado |
| --- | --- | --- |
| `coins` | `PRIMARY KEY (id)` | Confirmado por el DDL del test de integración y necesario para upsert/búsqueda. |
| `users` | `PRIMARY KEY (id)` | Inferido por `lastrowid`/lookup; no existe DDL versionado para confirmarlo. |
| `users` | `UNIQUE (email)` | Regla de negocio documentada y consultada, pero constraint no confirmado en DDL actual. |
| `favorites` | `PRIMARY KEY (user_id, coin_id)` | Documentado y coherente con todas las queries; DDL normal no versionado. |
| `price_history` | `PRIMARY KEY (id)` | Confirmado por el DDL de integración. |
| `price_history` | FK `coin_id → coins.id` | Confirmada por el DDL de integración. |

Una primary key ya crea un índice. No se debe agregar otro índice redundante sobre la misma columna sin medir una necesidad concreta.

## 5. Queries analizadas

### Coins

```sql
SELECT *
FROM coins
ORDER BY market_cap_rank ASC;
```

Se propone `(market_cap_rank, id)` para ayudar al ordenamiento y producir un desempate estable. `id` también permite que el orden sea determinista cuando dos monedas tienen el mismo rank.

### Favorites

```sql
SELECT *
FROM favorites
WHERE user_id = %s;
```

```sql
SELECT 1
FROM favorites
WHERE user_id = %s
  AND coin_id = %s
LIMIT 1;
```

La clave compuesta esperada `(user_id, coin_id)` ya cubre ambos patrones: por el prefijo `user_id` en el primer caso y por las dos columnas en el segundo. No se agrega un índice adicional sobre `user_id`.

### Users

```sql
SELECT 1 FROM users WHERE email = %s LIMIT 1;
SELECT * FROM users WHERE email = %s;
```

La base normal debería tener `UNIQUE(email)`. Además de proteger la regla de negocio, ese constraint crea el índice necesario para login y detección de email duplicado. El service sigue haciendo una comprobación previa, pero la base debe ser la última garantía contra carreras concurrentes.

### Price History por fecha

```sql
SELECT id, coin_id, price, recorded_at
FROM price_history
WHERE coin_id = %s
  AND recorded_at >= %s
  AND recorded_at <= %s
ORDER BY recorded_at ASC, id ASC
LIMIT %s OFFSET %s;
```

El índice candidato es:

```sql
INDEX idx_price_history_coin_recorded_at
    (coin_id, recorded_at, id)
```

El orden sigue la forma de la consulta: igualdad por coin, rango/orden por fecha y desempate por id.

También ayuda a encontrar el primer y último precio:

```sql
ORDER BY recorded_at ASC, id ASC LIMIT 1;
ORDER BY recorded_at DESC, id DESC LIMIT 1;
```

### Price History por precio

```sql
WHERE coin_id = %s
  AND price >= %s
  AND price <= %s
ORDER BY price DESC, id ASC;
```

El índice candidato es:

```sql
INDEX idx_price_history_coin_price
    (coin_id, price, id)
```

Este índice se añadió al esquema de integración porque existe una ruta de consulta real con min/max y orden por precio. En una base grande conviene medir si ambos índices compuestos compensan su coste de escritura y almacenamiento.

### Agregaciones temporales

Las agregaciones usan `DATE_FORMAT`, `DATE` o `DATE_SUB` sobre `recorded_at` y agrupan por periodo. El índice `(coin_id, recorded_at, id)` ayuda a filtrar por `coin_id` y fechas, pero no elimina necesariamente el coste de agrupar por una expresión calculada.

## 6. Índices implementados en integración

El fixture `app/tests/integration/test_price_history_integration.py` ahora:

1. Declara los índices en el `CREATE TABLE`.
2. Usa `_ensure_index()` para bases de testing creadas antes del módulo.
3. Consulta `SHOW INDEX` y crea un índice faltante con nombres/columnas constantes.
4. Verifica en un test que los tres índices existen.

Índices:

```text
coins:
  idx_coins_market_cap_rank (market_cap_rank, id)

price_history:
  idx_price_history_coin_recorded_at (coin_id, recorded_at, id)
  idx_price_history_coin_price       (coin_id, price, id)
```

La interpolación de nombres en `_ensure_index()` no recibe input HTTP ni valores externos; son identificadores constantes del fixture. Los valores de comprobación siguen parametrizados.

## 7. SQL recomendado para la base normal

Este SQL debe aplicarse mediante una migración o una operación controlada, no automáticamente al importar la aplicación:

```sql
-- Solo si coins.id no tiene ya una PRIMARY KEY/UNIQUE equivalente.
ALTER TABLE coins
    ADD INDEX idx_coins_market_cap_rank (market_cap_rank, id);

-- La regla de email único debe existir en la base normal.
ALTER TABLE users
    ADD UNIQUE KEY uq_users_email (email);

ALTER TABLE price_history
    ADD INDEX idx_price_history_coin_recorded_at
        (coin_id, recorded_at, id),
    ADD INDEX idx_price_history_coin_price
        (coin_id, price, id);
```

No ejecutar este bloque ciegamente: si un índice o constraint ya existe, MySQL devolverá error. Primero debe verificarse:

```sql
SHOW CREATE TABLE coins;
SHOW CREATE TABLE users;
SHOW CREATE TABLE favorites;
SHOW CREATE TABLE price_history;

SHOW INDEX FROM coins;
SHOW INDEX FROM users;
SHOW INDEX FROM favorites;
SHOW INDEX FROM price_history;
```

## 8. Índices que no se agregan ahora

- Índice adicional sobre `coins.id`: ya es primary key.
- Índice adicional sobre `favorites.user_id`: el prefijo de la PK compuesta lo cubre.
- Índice sobre `favorites.coin_id`: no hay query actual que busque favoritos por moneda.
- Índices separados sobre `price_history.coin_id` y `price_history.recorded_at`: el compuesto refleja mejor las consultas actuales.
- Índices sobre expresiones de agregación: requieren medir versión/configuración de MySQL y no deben inventarse sin `EXPLAIN`.
- Índices para columnas no consultadas: aumentarían el coste de `INSERT`/`UPDATE` sin beneficio demostrado.

## 9. Impacto en operaciones

| Operación | Beneficio potencial | Coste |
| --- | --- | --- |
| SELECT por `coin_id`/fecha | Menos filas examinadas y ordenamiento más favorable | Espacio y mantenimiento del índice |
| SELECT por `coin_id`/precio | Mejor filtro y orden por precio | Segundo índice compuesto en Price History |
| `SELECT` de coins ordenado por rank | Puede evitar sort completo | Beneficio depende de tamaño/selectividad |
| INSERT de Price History | Sin beneficio directo | Debe actualizar dos índices adicionales |
| UPDATE de precio/fecha | Puede requerir actualizar índices | Mayor coste de escritura |
| DELETE por coin | Puede localizar registros por índice | Coste normal de mantenimiento |

Un índice acelera lecturas a cambio de espacio y escrituras. Por eso el siguiente módulo debe usar `EXPLAIN` para comprobar el plan, no asumir que el índice siempre se utiliza.

## 10. Tests y comandos

Test de integración añadido:

```text
test_integration_schema_has_indexes_for_current_queries
```

Comandos:

```powershell
python -m pytest app/tests/integration/test_price_history_integration.py -q
python -m pytest -q
python -m unittest discover -s app/tests -p "*_test.py"
```

El test de índices requiere `MYSQL_TEST_DATABASE` y permisos para `CREATE TABLE`, `ALTER TABLE` y `SHOW INDEX` en esa base de testing. No modifica la base de aplicación.

## 11. Errores comunes

- Crear un índice para cada columna sin analizar queries.
- Repetir el índice de una primary key.
- Poner primero una columna de rango cuando antes existe una igualdad más selectiva.
- Confundir índice con constraint: un índice no sustituye siempre a `UNIQUE` o `FOREIGN KEY`.
- Crear índices redundantes para `favorites.user_id` cuando la PK compuesta ya empieza por esa columna.
- Ejecutar DDL automáticamente al importar `app`.
- Afirmar que un índice se usa sin ejecutar `EXPLAIN`.
- Olvidar que cada índice aumenta el coste de inserciones y actualizaciones.

## 12. Decisiones y trade-offs

- Se eligieron índices compuestos que siguen los filtros y ordenamientos reales.
- Se incluyó `id` como desempate en los índices de Price History porque las queries también lo usan.
- Se aplicaron índices solo en la base de integración porque no hay migraciones normales.
- No se introdujo Alembic ni un sistema de migraciones nuevo en esta fase.
- No se agregó un índice sobre cada campo posible.
- Se dejó `UNIQUE(email)` como recomendación explícita para la base normal, porque la evidencia de código no basta para afirmar que el constraint existe.

## 13. Checklist

- [x] Queries de repositories analizadas.
- [x] Claves existentes separadas de índices recomendados.
- [x] Índice de ordenamiento de Coins definido.
- [x] Índices compuestos de Price History definidos.
- [x] Redundancias evitadas en Favorites.
- [x] Índices aplicados idempotentemente en integración.
- [x] Test `SHOW INDEX` añadido.
- [x] SQL recomendado documentado.
- [x] Impacto en SELECT/INSERT/UPDATE explicado.
- [x] Limitación por ausencia de migraciones documentada.
- [x] No se modificó la base principal.

## 14. Estado final y siguiente módulo

M74 queda implementado en el esquema de integración y documentado para la base normal. El backend todavía no aplica automáticamente migraciones a la base de aplicación.

El siguiente módulo es M75 — análisis de consultas SQL con `EXPLAIN`, para comprobar si MySQL utiliza realmente los índices y medir el coste de las consultas de Price History.

