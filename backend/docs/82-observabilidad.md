# Módulo 82 — Observabilidad básica

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Observabilidad / API / Runtime  
> **Módulo anterior:** 81 — Configuración por entornos  
> **Siguiente módulo:** 83 — OpenAPI y documentación de API

## 1. Objetivo

M80 agregó logs JSON. M82 añade contexto para relacionar una respuesta HTTP con sus logs y métricas mínimas para observar el proceso sin introducir todavía un sistema externo.

Se implementan:

- `X-Request-ID` en respuestas HTTP;
- contexto de request mediante `ContextVar`;
- request ID en logs JSON;
- contadores de requests, errores, duración acumulada y status;
- exposición CORS del header `X-Request-ID`.

## 2. Request ID

Cada request recibe un UUID generado por el servidor:

```text
Request
  │
  ├── generar UUID
  ├── guardarlo en ContextVar
  ├── incluirlo en logs
  ├── devolverlo como X-Request-ID
  └── limpiar el contexto en finally
```

El backend no reutiliza un ID enviado por el cliente. Esto evita aceptar valores arbitrarios como contexto de logs y hace que el identificador sea controlado por el servidor.

Ejemplo:

```http
HTTP/1.1 200 OK
X-Request-ID: 1f2f12c8-6b03-4d9e-aac9-37c2e0f7650a
```

El frontend puede enviar este ID al soporte técnico junto con un error para buscar el evento correspondiente.

## 3. ContextVar

`ContextVar` permite asociar el request ID al contexto de ejecución actual sin pasar el valor manualmente por controllers, services y repositories.

El middleware utiliza un token:

```python
token = set_request_id(request_id)
try:
    # ejecutar request
finally:
    reset_request_id(token)
```

La limpieza en `finally` es obligatoria. Sin ella, una tarea reutilizada podría conservar el ID de una request anterior.

## 4. Métricas internas

`RequestMetrics` mantiene contadores thread-safe por proceso:

```json
{
  "total_requests": 12,
  "error_responses": 2,
  "total_duration_ms": 83.42,
  "status_counts": {
    "200": 10,
    "404": 1,
    "500": 1
  }
}
```

Las métricas no se agrupan por path para evitar cardinalidad ilimitada causada por IDs dinámicos.

El objeto vive en `app.state.request_metrics`. Todavía no existe un endpoint público para consultarlo; M84 tratará health/readiness y decidirá qué información debe exponerse.

## 5. Qué significa “error”

Para estas métricas, cualquier status `>= 400` incrementa `error_responses`, incluyendo errores de validación o autorización. Un error de middleware sin respuesta se contabiliza como `500`.

Esta métrica es operativa, no sustituye la clasificación de errores de dominio ni los handlers HTTP.

## 6. CORS

El middleware CORS expone `X-Request-ID` mediante:

```python
expose_headers=["X-Request-ID"]
```

Esto permite que un navegador lea el header. No se expone ningún token ni credencial.

## 7. Seguridad y privacidad

No se registran:

- body;
- query params;
- cookies;
- Authorization;
- password;
- JWT;
- headers completos.

El request ID no autentica ni autoriza. Solo correlaciona eventos y puede ser conocido por el cliente.

## 8. Limitaciones

- Las métricas son en memoria y por proceso.
- Se pierden al reiniciar la aplicación.
- No se comparten entre workers.
- No hay histogramas de latencia ni percentiles `p95`/`p99`.
- No existe exportación a Prometheus, OpenTelemetry o un proveedor externo.
- No se implementó un endpoint de métricas público.

Estas limitaciones son intencionales. Antes de añadir infraestructura externa debe definirse el contrato de métricas y el entorno de despliegue.

## 9. Tests

Se agregaron:

```text
app/tests/unit/test_observability.py
app/tests/api/test_observability_endpoints.py
```

Se verifica:

- agregación y reset de contadores;
- presencia de un UUID válido en `X-Request-ID`;
- compatibilidad con los endpoints existentes.

## 10. Comandos

Tests focalizados:

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/unit/test_observability.py app/tests/api/test_observability_endpoints.py -q
```

Suite completa:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

## 11. Checklist

- [x] UUID de request generado por servidor.
- [x] `X-Request-ID` agregado a respuestas.
- [x] Contexto asociado mediante `ContextVar`.
- [x] Contexto limpiado en `finally`.
- [x] Request ID incorporado al formatter JSON.
- [x] Métricas básicas thread-safe agregadas.
- [x] CORS expone únicamente el request ID.
- [x] Datos sensibles excluidos.
- [x] Tests unitarios y API agregados.
- [x] No se agregó dependencia externa.

## 12. Estado final

M82 queda implementado y verificado. El backend puede correlacionar requests con logs y conservar métricas básicas por proceso. El siguiente módulo se enfocará en el contrato OpenAPI y la documentación pública de la API.
