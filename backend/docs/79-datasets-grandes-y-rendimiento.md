# Módulo 79 — Datasets grandes y rendimiento

> **Estado:** IMPLEMENTADO Y VERIFICADO EN INTEGRACIÓN  
> **Proyecto:** Crypto Tracker  
> **Capa:** Performance / Price History / Testing  
> **Módulo anterior:** 78 — Conexiones MySQL y pooling  
> **Siguiente módulo:** 80 — Logging estructurado

## 1. Objetivo

Comprobar que las consultas de Price History conservan su contrato cuando la tabla contiene muchas observaciones y reconocer los límites de la paginación actual.

Este módulo no fija tiempos máximos artificiales. La latencia depende del hardware, disco, versión de MySQL, estadísticas y concurrencia. Los tests verifican resultados y planes representativos; una medición de producción requiere métricas reales.

## 2. Estado previo

La API actual ofrece:

```text
limit: 1..100
offset: >= 0
sort_by: recorded_at | price
sort_order: asc | desc
```

El límite máximo de página evita que un cliente solicite una respuesta arbitrariamente grande. Sin embargo, `offset` no tiene un máximo.

Una consulta profunda como:

```sql
LIMIT 20 OFFSET 4500
```

puede obligar a MySQL a localizar y descartar miles de filas antes de devolver las 20 solicitadas. El índice reduce la búsqueda y el ordenamiento, pero no elimina completamente el coste de saltar filas.

## 3. Dataset de integración

El archivo `app/tests/integration/test_price_history_integration.py` agrega un fixture con:

```text
5.000 observaciones
1 observación por minuto
1 moneda de prueba
precios deterministas
fechas deterministas relativas al momento del test
```

El fixture inserta mediante `executemany()` y la limpieza existente elimina los datos de la moneda al finalizar cada caso. Solo se utiliza `MYSQL_TEST_DATABASE`.

## 4. Verificaciones agregadas

### Página profunda

El test solicita:

```python
limit=20
offset=4_500
sort_by="recorded_at"
sort_order="asc"
```

Comprueba que:

- se devuelven exactamente 20 registros;
- el primer precio corresponde a la posición esperada;
- los registros mantienen orden temporal ascendente;
- todos pertenecen a la moneda solicitada.

Esto valida que la paginación limita la respuesta aunque el motor deba recorrer filas anteriores.

### Agregación temporal

El segundo test agrupa las 5.000 filas por día y comprueba que la suma de los contadores de todos los grupos sigue siendo 5.000.

La consulta puede procesar más filas que una página normal porque las agregaciones necesitan revisar todo el rango filtrado. El índice `(coin_id, recorded_at, id)` ayuda con el filtro temporal, pero no elimina el coste de agrupar mediante `DATE(recorded_at)`.

## 5. Resultado observado

```text
8 passed, 1 warning
```

La suite completa posterior debe continuar comprobando el total global de tests. La advertencia conocida corresponde a la compatibilidad entre Starlette y `httpx`.

## 6. OFFSET frente a keyset pagination

### OFFSET actual

Ventajas:

- contrato sencillo;
- fácil de consumir desde un frontend;
- permite saltar directamente a una página numerada.

Desventajas:

- el coste puede crecer con offsets grandes;
- inserciones nuevas pueden desplazar páginas;
- no representa bien un recorrido continuo de un historial muy grande.

### Keyset pagination

Para un recorrido temporal ascendente, una alternativa futura sería enviar el último cursor recibido:

```sql
SELECT id, coin_id, price, recorded_at
FROM price_history
WHERE coin_id = %s
  AND (
      recorded_at > %s
      OR (recorded_at = %s AND id > %s)
  )
ORDER BY recorded_at ASC, id ASC
LIMIT %s;
```

El cursor debe contener al menos `recorded_at` e `id`, porque ambos forman el orden estable. Esta alternativa suele escalar mejor para “siguiente página”, pero no permite saltar arbitrariamente a la página 200 con la misma facilidad.

No se implementa en M79 porque cambiaría el contrato HTTP actual de `offset` a cursor. Debe diseñarse como una evolución explícita, posiblemente con un endpoint o parámetros compatibles durante una transición.

## 7. Otras observaciones de escala

- `SELECT *` debe evitarse en endpoints que no necesitan todas las columnas.
- Las agregaciones temporales con funciones sobre `recorded_at` pueden necesitar estrategias distintas en tablas muy grandes.
- `COUNT`, `MIN`, `MAX` y `AVG` recorren el conjunto filtrado; el índice ayuda a encontrarlo, pero no reemplaza el trabajo de agregación.
- Un pool por worker limita la cantidad de conexiones por proceso, pero el total debe multiplicarse por la cantidad de workers.
- Los tests de integración no sustituyen una prueba de carga con concurrencia real.

## 8. Seguridad y límites

El límite `limit <= 100` se conserva como protección básica contra respuestas enormes. `offset` no debe confiarse como mecanismo de seguridad ni como garantía de rendimiento.

El futuro diseño de cursor debe:

- validar formato y tamaño;
- evitar aceptar SQL dentro del cursor;
- firmar o codificar de forma segura los valores si se exponen al cliente;
- incluir el filtro y orden relevantes para no reutilizar un cursor en otra consulta.

## 9. Tests y comandos

Integración de Price History:

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/integration/test_price_history_integration.py -q
```

Suite completa:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

El test de dataset grande requiere una base MySQL de testing configurada y permisos para insertar 5.000 filas.

## 10. Checklist

- [x] Dataset de 5.000 filas agregado a integración.
- [x] Página profunda con `OFFSET` verificada.
- [x] Respuesta máxima de 20 elementos verificada.
- [x] Orden temporal verificado.
- [x] Conteo completo de agregaciones verificado.
- [x] Coste potencial de `OFFSET` documentado.
- [x] Keyset pagination evaluada sin cambiar el contrato actual.
- [x] No se modificó la base principal.

## 11. Estado final

M79 queda implementado y verificado. El backend soporta correctamente las consultas probadas con 5.000 observaciones, pero la paginación profunda mediante `OFFSET` queda identificada como el siguiente candidato de evolución si el volumen real crece.
