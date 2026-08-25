# Módulo 77 — Decisión sobre caching

> **Estado:** EVALUADO — CACHE DIFERIDO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Performance / Consistencia  
> **Módulo anterior:** 76 — Optimización SQL  
> **Siguiente módulo:** 78 — Conexiones MySQL y pooling

## 1. Objetivo

Evaluar si el backend necesita cache y, si la respuesta es afirmativa, identificar qué datos pueden almacenarse temporalmente sin romper la consistencia.

La decisión de este módulo es no agregar todavía una implementación de cache. No se introduce una estructura en memoria solo porque exista la posibilidad teórica de reutilizar respuestas.

## 2. Evidencia del código actual

### Lecturas locales

Estas rutas consultan datos propios en MySQL:

```text
GET /coins
GET /coins/{coin_id}
GET /favorites
GET /favorites/details
GET /coins/{coin_id}/price-history
GET /coins/{coin_id}/price-history/statistics
GET /coins/{coin_id}/price-history/variation
GET /coins/{coin_id}/price-history/aggregations
```

Sus repositories abren conexiones y leen el estado actual de la base. Cachear esas respuestas requeriría invalidar correctamente cuando ocurren:

- sincronizaciones de monedas;
- inserciones de Price History;
- altas o bajas de favoritos;
- modificaciones de usuarios.

Actualmente no existe un evento de invalidación, una política de versionado ni un cache distribuido.

### Llamadas externas

CoinGecko se utiliza en operaciones explícitas de sincronización:

```text
POST /coins/sync
POST /coins/{coin_id}
```

Estas operaciones se esperan como una actualización de datos. Servir una respuesta cacheada podría ocultar cambios recientes de CoinGecko y contradecir la intención del endpoint.

## 3. Por qué no se implementa ahora

Un cache tiene dos costes que no deben ignorarse:

1. **Consistencia:** hay que definir cuándo un valor deja de ser válido.
2. **Operación:** un cache en memoria no se comparte entre workers ni instancias.

En este backend, el riesgo principal sería introducir datos desactualizados sin que exista todavía una necesidad medida que lo compense. La aplicación tampoco tiene métricas de hit ratio, latencia por endpoint o volumen de solicitudes que permitan justificar un TTL concreto.

La decisión es coherente con M72: el rate limiter en memoria ya está documentado como limitado a un proceso. No conviene multiplicar ese patrón en otra funcionalidad sin una necesidad concreta.

## 4. Alternativas consideradas

### Cache en memoria con TTL

Sería sencillo de implementar, pero cada worker tendría valores distintos y las invalidaciones serían parciales. Puede servir para desarrollo o datos públicos de corta vida, no como solución general de producción.

### Redis

Resolvería coordinación entre procesos y permitiría TTL, invalidación y métricas más robustas. Actualmente sería una dependencia operacional nueva sin evidencia suficiente de que el proyecto la necesite.

### Cache HTTP

Los headers `Cache-Control`, `ETag` o `Last-Modified` podrían ser adecuados para respuestas de solo lectura. Primero habría que definir contratos de frescura para cada endpoint y comprobar que el frontend realmente puede aprovecharlos.

### Optimización de MySQL

Antes de cachear conviene resolver el coste estructural más evidente: cada método de repository abre y cierra su propia conexión. El pooling y el ciclo de vida de conexiones corresponden al siguiente módulo.

## 5. Criterios para reabrir la decisión

El cache debería reconsiderarse cuando exista evidencia como:

- un endpoint de lectura repetido con latencia relevante;
- consultas repetidas idénticas dentro de un intervalo corto;
- límites de CoinGecko alcanzados por solicitudes equivalentes;
- métricas de hit ratio potencial;
- una política explícita de frescura por recurso;
- una estrategia de invalidación probada;
- necesidad de coordinar múltiples workers.

Una implementación futura debería incluir como mínimo:

```text
clave estable
TTL explícito
hit/miss medible
invalidación
protección ante errores
comportamiento multi-worker documentado
tests de expiración y consistencia
```

## 6. Seguridad y corrección

No agregar cache ahora evita:

- servir información de otro usuario por una clave incompleta;
- mezclar respuestas de distintos parámetros;
- almacenar tokens o datos sensibles sin una política;
- retener datos eliminados;
- ocultar actualizaciones de sincronización.

Si se implementa más adelante, las claves deben incluir todos los parámetros relevantes y nunca deben basarse únicamente en un path cuando también existen query params o identidad de usuario.

## 7. Tests

No se agregan tests de cache porque no se agregó comportamiento de cache. La suite existente continúa siendo la evidencia de que la decisión no altera el backend.

Comandos de verificación:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

## 8. Checklist

- [x] Rutas de lectura local identificadas.
- [x] Llamadas externas de sincronización identificadas.
- [x] Riesgo de datos stale documentado.
- [x] Límite de cache en memoria multi-worker documentado.
- [x] Redis evaluado sin introducirlo prematuramente.
- [x] Criterios de adopción futura definidos.
- [x] No se agregó dependencia ni configuración innecesaria.
- [x] No se modificó la base principal.

## 9. Estado final

M77 queda cerrado como una decisión técnica: **no implementar cache todavía**. El siguiente problema concreto es el ciclo de vida de conexiones MySQL, donde sí existe evidencia directa en los repositories actuales y una posible mejora de arquitectura compartida.
