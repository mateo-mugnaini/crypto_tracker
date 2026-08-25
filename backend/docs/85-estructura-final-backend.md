# Módulo 85 — Estructura final del backend

> **Estado:** AUDITADO, CONSOLIDADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Arquitectura / Organización del código  
> **Módulo anterior:** 84 — Health y readiness  
> **Siguiente módulo:** 86 — Preparación para deployment

## 1. Objetivo

Consolidar la estructura actual del backend y dejar claro dónde vive cada responsabilidad. Este módulo no mueve archivos históricos ni introduce una refactorización masiva: la prioridad es preservar imports y comportamiento comprobado.

## 2. Árbol vigente

```text
backend/
├── app/
│   ├── api/
│   │   ├── app.py                 FastAPI, middleware y rutas
│   │   ├── dependencies.py        Depends, auth y query params
│   │   ├── coingecko_client.py    Cliente HTTP externo
│   │   ├── health.py              Readiness de MySQL
│   │   └── rate_limiter.py        Límite de login por proceso
│   ├── config/
│   │   └── settings.py            Variables y validación por entorno
│   ├── controllers/               Adaptación HTTP ↔ services
│   ├── database/
│   │   └── connection.py          Pool de aplicación y conexión de test
│   ├── exceptions/                Jerarquía de errores
│   ├── models/                    Entidades Python del dominio
│   ├── repositories/              SQL y persistencia MySQL
│   ├── schemas/                   Contratos Pydantic HTTP
│   ├── security/                  Scrypt y JWT
│   ├── services/                  Reglas de negocio
│   ├── logging_config.py          Formatter JSON y configuración de logs
│   ├── observability.py           Request ID y métricas internas
│   ├── container.py               Composition root
│   └── main.py                    Sincronización puntual CLI
├── docs/                          Módulos pedagógicos y decisiones técnicas
├── app/tests/
│   ├── unit/                      Lógica aislada y mocks
│   ├── api/                       Contratos FastAPI y OpenAPI
│   ├── integration/               MySQL de testing
│   └── *_test.py                  Suite histórica unittest
├── .env.example                   Plantilla sin secretos
├── pytest.ini                     Configuración Pytest
├── requirements.txt               Dependencias fijadas
└── README.md                      Inicio operativo del backend
```

## 3. Dirección de dependencias

El flujo principal sigue:

```text
HTTP
 │
 ▼
FastAPI / dependencies / schemas
 │
 ▼
Controllers
 │
 ▼
Services ─────────► External API Client
 │
 ▼
Repositories
 │
 ▼
Database connection / MySQL
```

Reglas estructurales:

- las rutas no ejecutan SQL;
- los controllers no contienen reglas de negocio complejas;
- los services no conocen detalles HTTP;
- los repositories no conocen FastAPI;
- los schemas no reemplazan automáticamente a los models;
- `Container` construye dependencias concretas;
- la configuración se lee desde `settings`;
- los tests unitarios no abren red ni MySQL.

## 4. Entrypoints

### Servidor HTTP

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
```

### Aplicación FastAPI

```text
app.api.app:app
```

Incluye lifespan, middleware, CORS, logging, request IDs, health checks y rutas.

### Sincronización puntual

```powershell
.\.venv\Scripts\python.exe -m app.main
```

No inicia Uvicorn. Construye un `Container` y ejecuta una sincronización de `bitcoin`.

### Tests

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

## 5. Tests históricos

La carpeta `app/tests` raíz conserva archivos creados durante etapas anteriores del curso. Algunos tienen nombres terminados en `_test.py` y se ejecutan mediante `unittest` o Pytest.

No se movieron automáticamente porque:

- la suite histórica está operativa;
- algunos scripts se ejecutan directamente;
- moverlos puede cambiar imports o descubrimiento;
- la reorganización no aporta una mejora funcional inmediata.

La estructura objetivo para tests nuevos es:

```text
app/tests/unit
app/tests/api
app/tests/integration
```

## 6. Componentes transversales

### Configuración

`app/config/settings.py` centraliza `.env`, `APP_ENV`, JWT, MySQL, CORS, rate limiting, logging y pool.

### Seguridad

`app/security`, `app/api/dependencies.py` y `app/exceptions` cooperan para hashing, JWT, Bearer, authentication, ownership y respuestas seguras.

### Observabilidad

`app/logging_config.py`, `app/observability.py` y el middleware HTTP generan logs JSON, request IDs y contadores básicos por proceso.

### Base de datos

`app/database/connection.py` mantiene un pool lazy para la aplicación y conexiones directas para integración. Los repositories cierran cursores y conexiones en sus rutas actuales.

## 7. Deuda estructural pendiente

La estructura está consolidada, pero todavía existen decisiones fuera del alcance de M85:

- no hay migraciones versionadas ni DDL ejecutable del schema normal;
- `POST /coins/{coin_id}/price` continúa apuntando a un método ausente de `PriceHistoryController`;
- el rate limiter y las métricas son por proceso;
- no existe exportación de métricas ni tracing distribuido;
- no hay pipeline de deployment documentado;
- quedan scripts históricos con `print()` dentro de tests, fuera del runtime principal.

Estas deudas están separadas de la organización de carpetas y deben resolverse en módulos específicos.

## 8. Checklist de arquitectura

- [x] Paquetes principales identificados.
- [x] Entry point HTTP documentado.
- [x] Entry point CLI documentado.
- [x] Composition root identificado.
- [x] Dirección de dependencias documentada.
- [x] Capas HTTP, controller, service, repository y database separadas.
- [x] Tests nuevos ubicados por tipo.
- [x] Tests históricos preservados.
- [x] Componentes transversales documentados.
- [x] Deuda conocida separada de funcionalidades terminadas.

## 9. Estado final

M85 queda consolidado y verificado. El backend tiene una estructura explicable, entrypoints claros, capas reconocibles y una política explícita para preservar tests históricos sin confundirlos con la organización objetivo.
