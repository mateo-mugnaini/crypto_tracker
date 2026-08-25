# Módulo 83 — OpenAPI y documentación de la API

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** FastAPI / Contrato HTTP / OpenAPI  
> **Módulo anterior:** 82 — Observabilidad  
> **Siguiente módulo:** 84 — Health y readiness

## 1. Objetivo

Mejorar el contrato publicado por FastAPI para que `/docs`, `/redoc` y `/openapi.json` sean útiles para frontend, testing y consumidores externos.

El cambio se limita a metadata OpenAPI:

- tags globales;
- summaries;
- descriptions;
- response descriptions;
- errores importantes declarados en las operaciones;
- tests del esquema generado.

No se cambian rutas, bodies, queries, lógica de negocio ni status reales.

## 2. Grupos documentados

La API declara cinco tags:

| Tag | Alcance |
| --- | --- |
| `system` | Disponibilidad y metadatos operativos. |
| `coins` | Consulta y sincronización de monedas. |
| `favorites` | Operaciones sobre favoritos propios. |
| `users` | Registro, login y usuario actual. |
| `price-history` | Historial, estadísticas, variaciones y agregaciones. |

Los tags aparecen en el documento OpenAPI y agrupan las operaciones en Swagger UI.

## 3. Metadata de operaciones

Las rutas ahora tienen summaries orientados al consumidor, por ejemplo:

```text
Consultar historial de precios
Iniciar sesión
Obtener estadísticas de precios
Listar favoritos propios
Sincronizar monedas
```

Las descripciones explican intención y alcance sin duplicar la lógica de services o repositories.

## 4. Respuestas documentadas

Las operaciones conservan sus response models existentes y declaran errores relevantes:

```text
401 → autenticación o credenciales inválidas
404 → recurso inexistente
409 → conflicto de negocio
422 → validación automática de FastAPI/Pydantic
429 → rate limit del login
502 → CoinGecko no disponible
```

La documentación de un status no crea por sí misma una nueva rama funcional. El handler y el código real siguen siendo la fuente de comportamiento.

## 5. Contrato generado

Con el servidor levantado:

```text
Swagger UI  → http://127.0.0.1:8000/docs
ReDoc       → http://127.0.0.1:8000/redoc
OpenAPI JSON → http://127.0.0.1:8000/openapi.json
```

El JSON es la fuente automatizable para generar clientes, validar contratos o inspeccionar cambios en CI.

Ejemplo de inspección:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/openapi.json
```

## 6. Tests

Se agregó `app/tests/api/test_openapi.py`, que verifica:

- existencia de los cinco grupos de tags;
- summary de Price History;
- response `200` y `422` del historial;
- summaries y errores `401`/`429` del login.

Estos tests no necesitan MySQL ni CoinGecko real; utilizan `TestClient` y el documento generado por FastAPI.

## 7. Uso desde frontend

El frontend puede utilizar `/openapi.json` para conocer:

- rutas y métodos;
- parámetros de path y query;
- schemas Pydantic;
- bodies JSON;
- respuestas esperadas;
- errores documentados.

La documentación no reemplaza una librería de cliente ni garantiza que un consumidor use correctamente ownership o Bearer auth. Es el contrato técnico público, no una autorización.

## 8. Seguridad

- Swagger no debe contener secretos reales.
- Los ejemplos no deben incluir JWT válidos.
- Los endpoints protegidos siguen requiriendo Bearer token.
- La documentación no expone passwords ni hashes.
- La metadata no registra valores de configuración.

La seguridad de `/docs` en producción es una decisión de despliegue posterior; ocultar Swagger no reemplaza proteger la API.

## 9. Limitaciones encontradas

- Algunas respuestas de monedas todavía no tienen response models específicos.
- No se generó un cliente TypeScript automáticamente.
- No se agregó versionado de URL (`/v1`) porque cambiaría el contrato actual.
- La ruta `POST /coins/{coin_id}/price` continúa declarada, pero su controller tiene la limitación documentada en el README.
- Los errores de validación `422` siguen usando el formato estándar de FastAPI, distinto del envelope de errores de dominio.

Estas limitaciones deben resolverse mediante módulos específicos, no mezclando cambios de contrato con metadata.

## 10. Checklist

- [x] Tags globales declarados.
- [x] Todas las operaciones principales agrupadas.
- [x] Summaries agregados.
- [x] Descripciones agregadas donde aportan contexto.
- [x] Errores relevantes documentados.
- [x] Swagger, ReDoc y OpenAPI JSON documentados.
- [x] Test del documento generado agregado.
- [x] Contratos funcionales preservados.
- [x] No se expusieron secretos.

## 11. Estado final

M83 queda implementado y verificado. La API dispone de un contrato OpenAPI más claro para desarrollo manual, frontend, testing y herramientas de generación de clientes.
