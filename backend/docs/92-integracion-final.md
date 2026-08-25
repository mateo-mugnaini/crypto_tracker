# Módulo 92 — Integración final

> **Estado:** BACKEND VERIFICADO LOCALMENTE; FRONTEND PENDIENTE DE IMPLEMENTACIÓN
> **Proyecto:** Crypto Tracker
> **Capa:** Integración / Cierre del roadmap
> **Módulo anterior:** 91 — Charts

## 1. Objetivo

Cerrar el recorrido del backend comprobando que sus capas, contratos HTTP,
seguridad, configuración, observabilidad, health checks, tests y documentación
sean coherentes entre sí.

La integración visual completa no puede marcarse como implementada: `frontend/`
existe, pero no contiene `package.json`, framework, componentes ni cliente HTTP.

## 2. Corrección funcional realizada en M92

Se corrigió la única ruta declarada que todavía tenía una implementación
incompleta:

```http
POST /coins/{coin_id}/price
```

Flujo actual:

```text
Route
  ↓
PriceHistoryController.update_price
  ↓
PriceHistoryService.update_current_price
  ↓
CoinGeckoClient.get_current_price
  ↓
GET /simple/price?ids=<coin_id>&vs_currencies=usd
  ↓
PriceHistoryRepository.save
  ↓
PriceHistoryResponse
```

La ruta devuelve `PriceHistoryResponse` y traduce una respuesta externa sin
precio a `502 coingecko_unavailable`. La moneda debe existir localmente para
que la foreign key de `price_history` sea respetada.

## 3. Estado de las capas

```text
HTTP / FastAPI
  ├── schemas Pydantic
  ├── dependencies, auth y ownership
  ├── exception handlers
  └── OpenAPI
        ↓
Controllers
        ↓
Services
  ├── reglas de negocio
  ├── coordinación CoinGecko
  └── transformaciones analíticas
        ↓
Repositories
        ↓
MySQL mediante pool de aplicación
```

El `Container` continúa siendo el composition root. Las rutas no ejecutan SQL,
los repositories no conocen FastAPI y los tests unitarios no necesitan red ni
MySQL real.

## 4. Contrato operativo final

### Arranque local

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.api.app:app --reload --host 127.0.0.1 --port 8000
```

### Ejecución productiva

```powershell
python -m uvicorn app.api.app:app --host 0.0.0.0 --port 8000 --workers 1
```

La configuración productiva valida secretos, CORS, MySQL, timeout, JWT y rate
limiting durante el startup.

### Health checks

```text
GET /health/live  → proceso disponible
GET /health/ready → proceso y MySQL disponibles
```

### Documentación API

```text
/docs
/redoc
/openapi.json
```

## 5. Inventario funcional

| Área | Rutas principales |
| --- | --- |
| Sistema | `/`, `/health/live`, `/health/ready` |
| Coins | `GET /coins`, `POST /coins/sync`, `GET/POST /coins/{coin_id}` |
| Usuarios | `POST /users/register`, `POST /users/login`, `GET /users/me` |
| Favoritos | `POST /favorites`, `GET /favorites`, `GET /favorites/details`, `DELETE /favorites/{coin_id}` |
| Historial | `POST /coins/{coin_id}/price`, consulta paginada, estadísticas, variación y agregaciones |

Las rutas protegidas requieren Bearer y aplican ownership. Los errores conocidos
usan `detail.code` y `detail.message`; las validaciones usan `422` estándar de
FastAPI.

## 6. Verificación final ejecutada

### Pruebas funcionales de la corrección M92

```powershell
python -m pytest -q app/tests/unit/test_mocking.py app/tests/unit/test_price_history_update.py app/tests/api/test_api_endpoints.py
```

Resultado: **25 passed**.

### Suite Pytest completa

```powershell
python -m pytest -q
```

Resultado: **168 passed, 1 warning**.

### Suite histórica

```powershell
python -m unittest discover -s app/tests -p "*_test.py"
```

Resultado: **24 tests OK**.

### Verificaciones adicionales

- imports de la aplicación: correctos;
- OpenAPI: 17 paths y 5 grupos de tags;
- health routes: presentes;
- contrato `POST /coins/{coin_id}/price`: response model y `502` documentados;
- `git diff --check`: sin errores de whitespace.

La advertencia corresponde a la compatibilidad entre `TestClient` de Starlette y
la versión instalada de `httpx`; no afecta el servidor Uvicorn.

## 7. Checklist de cierre

- [x] Entrypoint ASGI documentado.
- [x] Configuración por entorno documentada.
- [x] CORS, JWT, hashing y ownership verificados.
- [x] Logging JSON y request IDs disponibles.
- [x] Liveness y readiness disponibles.
- [x] OpenAPI y schemas HTTP actualizados.
- [x] Paginación, filtros y charts documentados.
- [x] Ruta de actualización de precio funcional y testeada.
- [x] Suite Pytest completa aprobada.
- [x] Suite histórica aprobada.
- [ ] Crear frontend real y elegir stack.
- [ ] Automatizar migraciones/DDL.
- [ ] Definir CI/CD, rollback y plataforma de deployment.
- [ ] Externalizar rate limiter y métricas antes de escalar workers.

## 8. Deuda técnica que permanece

Estas tareas no bloquean el cierre técnico del backend local, pero sí deben
resolverse antes de un producto completo:

- `frontend/` continúa vacío;
- no hay migraciones versionadas ni DDL automatizado;
- rate limiting y métricas son locales al proceso;
- no hay tracing distribuido ni exportación de métricas;
- no hay Docker, CI/CD ni proveedor de deployment definido;
- permanece una advertencia de compatibilidad en `TestClient`/`httpx`.

## 9. Estado final

M92 cierra el roadmap del backend con la aplicación verificada localmente y sus
contratos documentados. La siguiente fase real del proyecto ya no es otro
módulo backend: es crear el frontend, elegir su stack y consumir el contrato
OpenAPI documentado.
