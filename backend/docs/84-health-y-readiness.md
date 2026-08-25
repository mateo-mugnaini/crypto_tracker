# Módulo 84 — Health checks y readiness

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Operación / API / Infraestructura  
> **Módulo anterior:** 83 — OpenAPI y documentación de API  
> **Siguiente módulo:** 85 — Estructura final del backend

## 1. Objetivo

Agregar endpoints operativos para distinguir entre:

- un proceso que está vivo y puede recibir requests;
- una instancia que está lista para recibir tráfico porque su dependencia principal responde.

Esta diferencia es necesaria para balanceadores, orquestadores, scripts de despliegue y monitoreo.

## 2. Liveness

Endpoint:

```http
GET /health/live
```

Respuesta:

```json
{
  "status": "ok",
  "service": "crypto-tracker-api",
  "checks": {}
}
```

Liveness no consulta MySQL ni CoinGecko. Si el proceso puede ejecutar FastAPI, responde `200`.

Un liveness que depende de la base puede provocar reinicios innecesarios: una caída temporal de MySQL haría parecer muerto un proceso que sigue funcionando y podría recuperarse.

## 3. Readiness

Endpoint:

```http
GET /health/ready
```

Consulta:

```sql
SELECT 1;
```

Respuesta lista:

```json
{
  "status": "ready",
  "service": "crypto-tracker-api",
  "checks": {
    "database": "ok"
  }
}
```

Si MySQL no responde, la ruta devuelve `503 Service Unavailable` y:

```json
{
  "status": "not_ready",
  "service": "crypto-tracker-api",
  "checks": {
    "database": "unavailable"
  }
}
```

No se filtra el mensaje de la excepción del driver, hostname, usuario ni cadena de conexión.

## 4. Flujo de readiness

```text
GET /health/ready
        │
        ▼
Obtener conexión del pool
        │
        ▼
SELECT 1
        │
   ┌────┴────┐
   ▼         ▼
 OK       Error
 200        503
```

El cursor y la conexión se cierran en `finally`. En producción, cerrar una conexión del pool la devuelve al pool.

## 5. Health schema

`HealthResponse` documenta los tres estados posibles:

```text
ok
ready
not_ready
```

El campo `checks` permite agregar dependencias futuras de forma explícita, pero el módulo actual solo verifica `database`.

CoinGecko no se incluye en readiness porque es un proveedor externo y no debe impedir que la API sirva lecturas locales o responda errores controlados. Su disponibilidad se observa mediante logs y métricas de las operaciones que lo utilizan.

## 6. Uso operativo

Un balanceador puede usar:

```text
/health/live  → reinicio del proceso si falla
/health/ready → retirar del tráfico si falla
```

Durante un despliegue:

1. inicia el proceso;
2. espera que `/health/ready` responda `200`;
3. agrega la instancia al tráfico;
4. antes de detenerla, la marca no lista y deja finalizar requests existentes.

La coordinación de graceful shutdown depende del servidor y del entorno de despliegue; este módulo solo define los checks HTTP.

## 7. Seguridad

- Los endpoints no requieren autenticación.
- No aceptan parámetros.
- No devuelven secretos ni detalles de infraestructura.
- Pueden limitarse por red en entornos sensibles.
- El status `503` comunica disponibilidad sin explicar credenciales o topología.

Liveness y readiness no sustituyen autenticación de endpoints de negocio.

## 8. OpenAPI

Ambos endpoints pertenecen al tag `system` y aparecen en `/docs`, `/redoc` y `/openapi.json`. Readiness declara explícitamente la respuesta `503` en el contrato OpenAPI.

## 9. Tests

`app/tests/api/test_health.py` verifica:

- liveness sin dependencia de MySQL;
- readiness exitoso con `SELECT 1`;
- readiness degradado con respuesta `503` segura;
- cierre de cursor y conexión.

Los tests mockean la conexión y no afectan la base real.

## 10. Comandos

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/api/test_health.py -q
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

Con el servidor levantado:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health/live
Invoke-RestMethod http://127.0.0.1:8000/health/ready
```

## 11. Checklist

- [x] Liveness sin dependencia externa.
- [x] Readiness con `SELECT 1`.
- [x] Respuesta `503` cuando MySQL no está disponible.
- [x] Errores internos no expuestos.
- [x] Cursor y conexión cerrados.
- [x] Schemas Pydantic agregados.
- [x] Rutas documentadas en OpenAPI.
- [x] Tests API agregados.
- [x] No se modificó la lógica de negocio.

## 12. Estado final

M84 queda implementado y verificado. La API diferencia correctamente proceso vivo de instancia lista y ofrece contratos operativos seguros para despliegue y monitoreo.
