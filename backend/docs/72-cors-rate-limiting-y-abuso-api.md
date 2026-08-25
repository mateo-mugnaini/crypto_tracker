# Módulo 72 — CORS, rate limiting y abuso de API

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** API / Security  
> **Módulo anterior:** 71 — Secretos, `.env` y configuración segura  
> **Siguiente módulo:** 73 — Revisión general de seguridad

## 1. Objetivo

Este módulo añade dos controles HTTP que faltaban en la API:

1. CORS para permitir que el frontend consuma el backend desde orígenes explícitamente configurados.
2. Rate limiting básico para reducir intentos repetidos contra el endpoint de login.

El objetivo es entender qué problema resuelve cada control y dónde debe vivir. No se introduce Redis, una librería externa ni una arquitectura distribuida porque el proyecto todavía está en una etapa educativa y no existe una necesidad operativa que lo justifique.

## 2. Estado previo

Antes del módulo:

- FastAPI estaba funcionando con autenticación JWT y ownership.
- El frontend todavía no tenía orígenes CORS configurados en el backend.
- No existía `CORSMiddleware`.
- No existía rate limiting.
- Login estaba protegido por validación y JWT posterior, pero no por límite de intentos.
- La API declaraba `POST /coins/{coin_id}/price`, aunque su controller no tiene `update_price`. Ese bloqueo pertenece a Price History y no se resolvió en este módulo.

## 3. Conceptos

### CORS

CORS es una política aplicada por los navegadores. Un frontend en `http://127.0.0.1:5173` y una API en `http://127.0.0.1:8000` tienen orígenes distintos, aunque estén en la misma máquina. El navegador envía el header `Origin` y puede realizar primero una petición preflight `OPTIONS` para preguntar si el método y headers están permitidos.

La API responde mediante headers como:

```http
Access-Control-Allow-Origin: http://127.0.0.1:5173
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

No se habilita `allow_credentials` porque el sistema actual usa `Authorization: Bearer`, no cookies de sesión. En producción los orígenes deben ser explícitos; no se usa `*`.

### Rate limiting

Rate limiting limita cuántas operaciones puede realizar un cliente durante una ventana temporal. En este módulo se aplica al login, donde un atacante podría intentar muchas contraseñas.

La implementación usa una ventana deslizante en memoria por IP:

```text
IP ──► timestamps de intentos recientes
          │
          ├── menos de 10 en 60 segundos → permite
          └── 10 o más                  → HTTP 429
```

La respuesta 429 incluye `Retry-After` para que el cliente sepa cuántos segundos esperar aproximadamente.

## 4. Decisión arquitectónica

| Responsabilidad | Archivo | Motivo |
| --- | --- | --- |
| Leer orígenes y límites | `app/config/settings.py` | La política es configuración, no lógica de negocio. |
| CORS | `app/api/app.py` | Es middleware HTTP de FastAPI. |
| Algoritmo del límite | `app/api/rate_limiter.py` | Es una utilidad reutilizable de la capa API. |
| Seleccionar la IP y proteger login | `app/api/dependencies.py` | `Depends` mantiene el endpoint legible y testeable. |
| Error 429 | `app/exceptions/api_exception.py` y handler | Separa la señal interna del formato HTTP. |
| Tests | `app/tests/unit` y `app/tests/api` | Se prueba algoritmo aislado y contrato HTTP. |

No se coloca rate limiting en `UserService`: el service no debe conocer IPs, HTTP ni ventanas de requests.

## 5. Archivos modificados y creados

Modificados:

- `app/config/settings.py`: orígenes CORS y límites configurables.
- `app/exceptions/api_exception.py`: `RateLimitExceededException`.
- `app/exceptions/__init__.py`: export de la excepción.
- `app/api/dependencies.py`: dependency de límite de login.
- `app/api/app.py`: middleware CORS, handler 429 y dependencia en login.
- `.env.example`: variables nuevas.

Creados:

- `app/api/rate_limiter.py`.
- `app/tests/unit/test_rate_limiter.py`.
- `app/tests/api/test_security_endpoints.py`.
- `docs/72-cors-rate-limiting-y-abuso-api.md`.

## 6. Implementación relevante

### Configuración

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
RATE_LIMIT_LOGIN_MAX_REQUESTS=10
RATE_LIMIT_LOGIN_WINDOW_SECONDS=60
```

Los orígenes se separan por coma. La instancia actual usa defaults locales si la variable CORS no existe. En un entorno real los valores deben estar definidos explícitamente.

### Rate limiter

`InMemoryRateLimiter` conserva una cola de timestamps por clave y usa `time.monotonic()` para no depender de cambios del reloj del sistema. Un `Lock` protege el diccionario porque una aplicación ASGI puede procesar solicitudes concurrentes.

El algoritmo:

1. Calcula el límite temporal desde el intento más antiguo conservado.
2. Elimina timestamps vencidos.
3. Si ya hay `max_requests`, devuelve rechazo y `retry_after`.
4. Si no, registra el intento y devuelve el número restante.

### Dependencia

`get_login_rate_limit` obtiene `request.client.host` y usa la IP como clave. No se confía en `X-Forwarded-For`, porque falsificar ese header sería trivial si no existe un proxy confiable configurado.

### Handler

La excepción se transforma en:

```json
{
  "detail": {
    "code": "rate_limit_exceeded",
    "message": "Demasiadas solicitudes. Intenta nuevamente más tarde."
  }
}
```

con status `429` y header `Retry-After`.

## 7. Tests

Tests unitarios:

- permite solicitudes hasta el límite;
- rechaza la siguiente;
- mantiene clientes aislados;
- permite limpiar el estado con `reset()`.

Tests API:

- preflight CORS permite `127.0.0.1:5173`;
- un origen desconocido no recibe `Access-Control-Allow-Origin`;
- el login devuelve `429` después de 10 requests y añade `Retry-After`.

Comandos:

```powershell
python -m pytest app/tests/unit/test_rate_limiter.py app/tests/api/test_security_endpoints.py
python -m pytest -q
python -m unittest discover -s app/tests -p "*_test.py"
```

El test de rate limiting limpia el estado compartido antes y después de ejecutarse para no contaminar otros tests.

## 8. Limitaciones y trade-offs

La solución en memoria es deliberadamente simple y apropiada para aprender el concepto, pero no es suficiente para producción distribuida:

- cada proceso tiene su propio contador;
- al reiniciar el proceso se pierde el estado;
- múltiples workers no comparten límites;
- no existe persistencia ni métricas;
- la IP puede representar un proxy compartido por muchos usuarios;
- no hay rate limiting general para todos los endpoints.

Una evolución futura podría usar Redis o un servicio administrado, pero solo cuando el despliegue tenga múltiples procesos o exista una necesidad real de escala. No se introduce esa dependencia ahora.

## 9. Prueba manual en Swagger

1. Levanta la API:

```powershell
python -m uvicorn app.api.app:app --reload --host 127.0.0.1 --port 8000
```

2. Abre <http://127.0.0.1:8000/docs>.
3. Ejecuta `POST /users/login` 10 veces desde el mismo cliente.
4. La siguiente petición debe responder `429`.
5. Espera la ventana configurada o reinicia el proceso durante desarrollo.

Para comprobar CORS desde un frontend, usa un origen configurado en `CORS_ALLOWED_ORIGINS` y observa los headers de la respuesta.

## 10. Checklist

- [x] Orígenes CORS configurables.
- [x] Preflight CORS probado.
- [x] Orígenes no autorizados no reciben permiso CORS.
- [x] Rate limiter thread-safe en memoria.
- [x] Login protegido contra intentos repetidos por IP.
- [x] HTTP 429 consistente con código de error.
- [x] `Retry-After` incluido.
- [x] Tests unitarios creados.
- [x] Tests API creados.
- [x] Limitaciones de producción documentadas.

## 11. Qué aprendimos

- CORS pertenece al middleware HTTP, no al service.
- Rate limiting de login es una preocupación de la API/security, no del dominio User.
- Una dependency de FastAPI permite proteger una route sin mezclar el límite con `UserService`.
- `time.monotonic()` es más apropiado que `datetime.now()` para medir ventanas.
- Un limiter en memoria es útil para el aprendizaje, pero no coordina múltiples procesos.
- Configuración, comportamiento y tests deben evolucionar juntos.

## 12. Estado final y siguiente módulo

M72 queda implementado en el código y documentado. El siguiente tema es M73 — revisión general de seguridad. Antes de avanzar, el usuario debe ejecutar los tests y confirmar el módulo.
