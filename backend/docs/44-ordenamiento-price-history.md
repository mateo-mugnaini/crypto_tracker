# Módulo 44 - Ordenamiento de Price History

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: API / Controller / Service / Repository
> **Fecha**: 2026-08-10

---

## 1. Objetivo

Permitir que el endpoint de historial ordene los registros por `recorded_at` o `price`, en orden ascendente o descendente, sin romper los filtros ni la paginación implementados en los módulos anteriores.

El problema real que se resuelve es que un cliente de API necesita controlar el orden de los resultados, pero no se puede insertar directamente en SQL un valor recibido por HTTP.

---

## 2. Conceptos aprendidos

- `ORDER BY`.
- `ASC` y `DESC`.
- Ordenamiento por fecha y precio.
- Whitelist de columnas y direcciones.
- SQL dinámico seguro.
- Por qué los parámetros `%s` no sirven para nombres de columnas.
- Integración Controller -> Service -> Repository.
- Combinación de ordenamiento, filtros y `LIMIT/OFFSET`.
- Ordenamiento determinista mediante `id ASC` como desempate.

---

## 3. Arquitectura y flujo

```text
GET /coins/{coin_id}/price-history?sort_by=price&sort_order=desc
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

FastAPI valida los valores permitidos para HTTP. El Service valida nuevamente antes de delegar. El Repository transforma únicamente valores de la whitelist en fragmentos SQL confiables.

---

## 4. Valores permitidos

| Parámetro | Valores permitidos | Valor por defecto |
|---|---|---|
| `sort_by` | `recorded_at`, `price` | `recorded_at` |
| `sort_order` | `asc`, `desc` | `asc` |

No se acepta texto arbitrario como nombre de columna.

---

## 5. Seguridad: por qué no se concatena la entrada

Esta implementación sería insegura:

```python
query += f" ORDER BY {sort_by} {sort_order}"
```

`sort_by` y `sort_order` podrían contener SQL no esperado. Además, los placeholders `%s` están pensados para valores, no para identificadores SQL:

```sql
ORDER BY %s
```

no parametriza correctamente un nombre de columna.

La solución utiliza mapas cerrados:

```python
SORTABLE_FIELDS = {
    "recorded_at": "recorded_at",
    "price": "price",
}

SORT_DIRECTIONS = {
    "asc": "ASC",
    "desc": "DESC",
}
```

Solo los valores producidos por esos mapas pueden llegar al `f-string` que forma el `ORDER BY`.

---

## 6. SQL generado

Para precio descendente con filtros y paginación:

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
ORDER BY price DESC, id ASC
LIMIT %s
OFFSET %s
```

Los valores continúan viajando como parámetros:

```python
["bitcoin", 64000, 65000, 10, 20]
```

La columna y la dirección no se parametrizan: se validan y se traducen mediante whitelist.

---

## 7. Archivos modificados y creados

- `[MODIFY]` `app/repositories/price_history_repository.py`: whitelist y construcción segura de `ORDER BY`.
- `[MODIFY]` `app/services/price_history_service.py`: parámetros y validación de ordenamiento.
- `[MODIFY]` `app/controllers/price_history_controller.py`: delegación de `sort_by` y `sort_order`.
- `[MODIFY]` `app/api/app.py`: parámetros de query con valores permitidos en OpenAPI.
- `[MODIFY]` `app/tests/price_history_service_test.py`: ordenamiento, normalización y rechazo de entradas inválidas.
- `[MODIFY]` `app/tests/price_history_controller_test.py`: propagación al Service.
- `[NEW]` `app/tests/price_history_repository_test.py`: SQL seguro, filtros, paginación y validación de whitelist.
- `[MODIFY]` `app/tests/service_test.py`: actualización del `FakeRepository` heredado para mantener la suite global compatible con `CoinService.exists()`.
- `[NEW]` `docs/44-ordenamiento-price-history.md`: registro histórico del módulo.

---

## 8. Compatibilidad con módulos anteriores

Los filtros (`start_date`, `end_date`, `min_price`, `max_price`) siguen siendo responsabilidad del Service/Repository. `limit` y `offset` tampoco se modifican. Las nuevas opciones tienen valores por defecto equivalentes al orden anterior:

```text
sort_by=recorded_at
sort_order=asc
```

Por tanto, una petición sin nuevos parámetros conserva el orden cronológico ascendente y el desempate por `id ASC`.

---

## 9. Pruebas automatizadas

Comandos ejecutados desde `backend/`:

```powershell
.venv\Scripts\python.exe -m app.tests.price_history_service_test
.venv\Scripts\python.exe -m app.tests.price_history_controller_test
.venv\Scripts\python.exe -m app.tests.price_history_repository_test
.venv\Scripts\python.exe -m compileall -q app
```

Resultado verificado:

```text
All price history service tests passed.
All price history controller tests passed.
Ran 3 tests ... OK
```

Los tests comprueban:

- `price DESC`.
- filtros y paginación combinados con ordenamiento.
- normalización de `PRICE`/`DESC`.
- rechazo de una columna manipulada.
- rechazo de una dirección no permitida.
- delegación Controller -> Service.
- ausencia de conexión a DB cuando la whitelist falla.

---

## 10. Prueba mediante Swagger

1. Desde `backend/`, iniciar el servidor:

   ```powershell
   .venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
   ```

2. Abrir `http://127.0.0.1:8000/docs`.
3. Usar `GET /coins/{coin_id}/price-history`.
4. Probar:

   ```text
   coin_id=bitcoin
   sort_by=price
   sort_order=desc
   min_price=64000
   max_price=65000
   limit=10
   offset=0
   ```

La respuesta debe devolver los registros filtrados por precio y ordenados del precio mayor al menor. Un valor no permitido para `sort_by` o `sort_order` debe producir una respuesta HTTP 422 por la validación de FastAPI.

---

## 11. Decisiones técnicas

- Se eligió una whitelist explícita porque solo hay dos campos de negocio necesarios.
- Se mantuvo la lógica SQL en el Repository.
- Se mantuvo la validación de entrada y normalización en el Service.
- Se agregó `id ASC` como desempate estable para que la paginación no cambie arbitrariamente cuando dos registros tienen el mismo precio o fecha.
- No se introdujeron clases, interfaces ni una capa adicional.

---

## 12. Error de entorno encontrado

La primera ejecución con el intérprete global falló antes de iniciar los tests porque no tenía instalado `python-dotenv`. El proyecto sí tiene un entorno virtual en `backend/.venv`. Al repetir la ejecución con ese intérprete apareció un doble de prueba heredado (`FakeRepository`) que no implementaba `exists()` y usaba un payload incoherente con sus aserciones. Se actualizó ese test, sin modificar producción, y la suite volvió a pasar. No se registró como error de implementación del M44.

---

## 13. Estado final

- [x] `ORDER BY` implementado.
- [x] Orden ascendente y descendente.
- [x] Orden por `recorded_at` y `price`.
- [x] Whitelist contra SQL Injection.
- [x] Integración API -> Controller -> Service -> Repository.
- [x] Compatibilidad con filtros.
- [x] Compatibilidad con paginación.
- [x] Tests creados y ejecutados.
- [x] OpenAPI refleja los valores permitidos.
- [x] Documentación creada.

---

## 14. Próximo módulo

**Módulo 45 - Estadísticas de Price History**

Se trabajarán `MIN`, `MAX`, `AVG` y `COUNT`. Esos conceptos no se adelantaron en este módulo.
