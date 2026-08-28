# Hardening de seguridad

Este módulo documenta las garantías aplicadas al backend y las condiciones que debe cumplir el entorno.

## Aplicado en código

- Las operaciones costosas (`POST /coins/sync`, `POST /coins/{coin_id}` y `POST /coins/{coin_id}/price`) requieren Bearer válido y tienen límite por IP.
- El registro y el login tienen límites por IP. El límite de conexiones SSE es de dos por usuario.
- El rate limiter en memoria elimina ventanas vencidas y tiene un máximo de claves. Sigue siendo un mecanismo por proceso: en producción debe existir además un límite en el reverse proxy o un store compartido como Redis.
- Las operaciones de venta y edición de ventas bloquean la fila del usuario dentro de la transacción antes de comprobar el saldo. Así se evita que dos solicitudes concurrentes vendan el mismo saldo.
- Solo se aceptan algoritmos JWT HMAC permitidos y hashes scrypt con parámetros conocidos; los parámetros recibidos desde la base no pueden provocar un coste arbitrario.
- En producción se exige HTTPS para el backend, CoinGecko, CORS y la URL consumida por los clientes. Las conexiones MySQL de producción requieren `MYSQL_SSL_CA` y verificación de certificado/identidad.
- Las respuestas incluyen headers defensivos y las aplicaciones web incluyen una política CSP. Los clientes mantienen el token únicamente en memoria; al recargar la página se debe iniciar sesión nuevamente.

## Comprobación de la base de datos

La aplicación no altera automáticamente una base existente. Antes de usarla en un entorno compartido, verificar con `SHOW CREATE TABLE` que existan:

- `UNIQUE (users.email)`;
- claves primarias compuestas en `favorites (user_id, coin_id)` y `portfolio_holdings (user_id, coin_id)`;
- claves foráneas hacia `users` y `coins` en favoritos, cartera, operaciones, alertas y precios;
- restricciones positivas para cantidades/precios y `fee_usd >= 0` en operaciones;
- índices para las consultas por usuario/moneda y fecha.

Las verificaciones y sentencias de referencia están en `docs/74-indices-y-claves.md`, `docs/96-cartera-operaciones.md` y `docs/97-alertas-notificaciones.md`. No ejecutar `ALTER TABLE` sin comprobar primero si los índices o constraints ya existen y si hay datos duplicados.

## Configuración local

En desarrollo se mantienen HTTP y MySQL local para facilitar el trabajo. En producción, completar `backend/.env` a partir de `.env.example`, incluyendo un certificado CA confiable:

```dotenv
APP_ENV=production
MYSQL_SSL_CA=/run/secrets/mysql-ca.pem
```

La terminación TLS puede estar en un reverse proxy. En ese caso, configurar correctamente los headers/proxy scheme para que Uvicorn vea las solicitudes externas como HTTPS y aplicar allí límites por IP, tamaño de request y timeouts.
