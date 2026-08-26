# Seguridad, rendimiento y despliegue

## Configuración por ambiente

El frontend solo lee variables `VITE_*`; cualquier valor con ese prefijo queda
embebido en el bundle público y nunca debe contener contraseñas, tokens privados
ni claves secretas.

Variables disponibles:

```dotenv
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT_MS=10000
VITE_MARKET_REFRESH_INTERVAL_MS=0
VITE_MARKET_LIVE_ENABLED=true
```

`VITE_API_BASE_URL` es obligatoria en una build de producción y debe ser una URL
absoluta `http` o `https`. En desarrollo y tests se usa la API local si no se
define. El resto de valores se normaliza con defaults seguros desde
`src/config/runtime.ts`.

## Sesión y datos sensibles

El token actual se guarda en `sessionStorage`, por lo que se elimina al cerrar la
pestaña y no se persiste como una preferencia permanente. El cliente no registra
tokens, credenciales ni payloads en consola. La evolución recomendada para un
entorno público es migrar a una cookie `HttpOnly`, `Secure` y `SameSite` con los
cambios coordinados en el backend.

## Headers del hosting

El servidor que entrega `dist/` debe agregar como mínimo:

- `Strict-Transport-Security` únicamente cuando todo el dominio funciona con
  HTTPS;
- `Content-Security-Policy` con `connect-src` limitado al frontend y a la API,
  incluyendo el endpoint SSE si se habilita;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` restringiendo cámara, micrófono y geolocalización.

La política exacta depende del hosting. No se fija una CSP incompleta dentro de
la aplicación porque la URL de la API y el dominio de despliegue cambian por
ambiente.

## Rendimiento

Las páginas se cargan con `React.lazy` y `Suspense`, de modo que el bundle
inicial no incluye todas las vistas protegidas. Vite mantiene los chunks
separados y deshabilita source maps de producción para no publicar código fuente
innecesariamente.

## Pipeline y rollback

Desde `frontend/` se puede ejecutar la validación completa con:

```powershell
npm ci
npm run check
```

Con el backend levantado, `npm run healthcheck` comprueba localmente que
`/health/live` responde. Usa `VITE_API_BASE_URL` si está definida y, en caso
contrario, consulta `http://127.0.0.1:8000`.

`check` ejecuta formato, TypeScript, lint, tests con cobertura y build. Para
publicar, conservar el artefacto `dist/` asociado al commit desplegado. Un
rollback consiste en volver a servir el artefacto de la versión anterior y
verificar que `VITE_API_BASE_URL` apunte al backend compatible.

## Estado actual

Implementado en esta etapa: validación de runtime, chunks por ruta, límite de
source maps, Error Boundary sin filtrado de detalles internos y comando único de
calidad. Pendiente para una puesta pública completa: CSP/headers en el hosting,
observabilidad sin datos sensibles y migración coordinada a cookie `HttpOnly`.
