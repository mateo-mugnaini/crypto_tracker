# Módulo 76 — Optimización SQL localizada

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Repository / MySQL / Performance  
> **Módulo anterior:** 75 — `EXPLAIN` y planes de ejecución  
> **Siguiente módulo:** caching solo si aparece una necesidad medida

## 1. Objetivo

Optimizar una consulta real sin cambiar el contrato del backend ni introducir una reescritura especulativa del acceso a datos.

El cambio elegido está en `CoinRepository.exists()`. La operación solo necesita responder:

```text
¿existe una moneda con este id?
```

La consulta anterior era:

```sql
SELECT COUNT(*)
FROM coins
WHERE id = %s;
```

La consulta actual es:

```sql
SELECT 1
FROM coins
WHERE id = %s
LIMIT 1;
```

## 2. Por qué es una optimización

`COUNT(*)` expresa una operación de conteo. Aunque `coins.id` sea una clave primaria y el caso actual tenga como máximo una coincidencia, la intención del método no es conocer una cantidad sino comprobar existencia.

`SELECT 1 ... LIMIT 1` expresa directamente esa intención:

- no devuelve columnas de la moneda;
- no calcula un agregado;
- puede finalizar al encontrar la primera coincidencia;
- conserva el uso del índice de la clave primaria;
- mantiene el mismo resultado booleano para el service.

La optimización no se basa en una promesa de milisegundos exactos. Es una mejora de forma de consulta, respaldada por el objetivo de la operación y compatible con el plan analizado en M75.

## 3. Flujo de la operación

```text
FavoriteService / CoinService
            │
            ▼
CoinRepository.exists(coin_id)
            │
            ▼
SELECT 1 FROM coins WHERE id = %s LIMIT 1
            │
            ▼
result is not None
```

La capa service no cambia. Continúa recibiendo un `bool` y no necesita conocer SQL.

## 4. Implementación

Archivo modificado:

```text
app/repositories/coin_repository.py
```

El repository ahora interpreta la fila devuelta con:

```python
result = cursor.fetchone()
return result is not None
```

Esto evita indexar el resultado como si fuera un contador. La existencia se determina por la presencia o ausencia de la fila.

Los valores siguen viajando como parámetros del driver:

```python
cursor.execute(query, (coin_id,))
```

No se concatena `coin_id` dentro del SQL.

## 5. Regression test

El test unitario existente fue actualizado en:

```text
app/tests/unit/test_mocking.py
```

Además de comprobar que el resultado es `True`, verifica que:

- la consulta contiene `SELECT 1`;
- la consulta contiene `LIMIT 1`;
- el identificador se envía como parámetro;
- cursor y conexión se cierran.

El caso sin coincidencia continúa cubierto por los tests existentes de repositories que simulan `fetchone() is None`.

## 6. Qué no se cambió

No se modificaron todavía:

- la paginación con `OFFSET` de Price History;
- las agregaciones por `DATE_FORMAT`, `DATE` o `DATE_SUB`;
- la consulta de primer/último precio;
- el pool de conexiones;
- la estructura del schema normal;
- los contratos HTTP.

Esas optimizaciones requieren mediciones representativas y podrían cambiar el comportamiento, la memoria o la complejidad operacional. M76 aplica el cambio de menor riesgo que resuelve una ineficiencia concreta.

## 7. Alternativas consideradas

### `SELECT EXISTS(...)`

También puede escribirse:

```sql
SELECT EXISTS(
    SELECT 1
    FROM coins
    WHERE id = %s
);
```

Devuelve directamente `0` o `1`, pero exige adaptar la lectura del resultado y no aporta una ventaja clara para este repository. Se eligió `SELECT 1 ... LIMIT 1` por ser simple y consistente con `UserRepository` y `FavoriteRepository`.

### Consultar la moneda completa

`find_by_id()` ya sirve cuando se necesitan los datos. Usarlo para una comprobación booleana transferiría columnas y mezclaría responsabilidades.

### Cambiar el service

No es necesario. La optimización pertenece al repository porque modifica exclusivamente la persistencia y conserva el contrato del service.

## 8. Seguridad y corrección

- El parámetro permanece separado del SQL.
- No se agregan identificadores dinámicos.
- No se modifica el esquema.
- No se modifican datos reales.
- La operación sigue usando la clave primaria `coins.id`.
- La semántica para moneda existente o inexistente permanece igual.

## 9. Tests y comandos

Test focalizado:

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/unit/test_mocking.py -q
```

Suite completa:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

Resultado focalizado:

```text
3 passed, 1 warning
```

La advertencia proviene de la compatibilidad entre Starlette y `httpx`, no de esta consulta.

## 10. Checklist

- [x] Consulta candidata identificada a partir del código actual.
- [x] `COUNT(*)` reemplazado por `SELECT 1 ... LIMIT 1`.
- [x] Contrato booleano preservado.
- [x] Parámetros SQL preservados.
- [x] Regression test actualizado.
- [x] Recursos del test verificados.
- [x] Alternativas y cambios aplazados documentados.
- [x] No se modificó la base principal.

## 11. Estado final

M76 queda implementado como una optimización SQL localizada, segura y verificable. El proyecto conserva una regla importante: optimizar consultas reales con evidencia, sin convertir cada posible mejora en un refactor prematuro.
