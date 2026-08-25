# Módulo 73 — Auditoría general de seguridad

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Security / API / configuración  
> **Módulo anterior:** 72 — CORS, rate limiting y abuso de API  
> **Siguiente módulo:** 74 — Índices y claves para consultas frecuentes

## 1. Objetivo

Auditar el backend completo después de implementar CORS y rate limiting. La auditoría cubre:

- autenticación;
- autorización y ownership;
- passwords;
- JWT;
- SQL Injection;
- CORS;
- rate limiting;
- secretos y configuración;
- validación de entradas;
- errores y exposición de información.

El objetivo no es declarar “seguro” el sistema sin matices. Es registrar qué controles existen, qué se verificó con tests, qué ajustes mínimos se aplicaron y qué riesgos siguen pendientes.

## 2. Estado previo

El backend ya contaba con:

- registro y login;
- hashing `scrypt`;
- access tokens JWT;
- `get_current_user` mediante `Depends`;
- protección Bearer de `users/me` y Favorites;
- ownership de Favorites;
- queries parametrizadas y whitelists para SQL dinámico;
- CORS configurable;
- rate limiting en memoria para login.

La revisión encontró tres inconsistencias que sí justificaban cambios pequeños:

1. Los errores de Bearer devolvían texto directo y no incluían `WWW-Authenticate`.
2. `PasswordHasher.verify()` no exigía base64 estricto para las partes del hash.
3. `TokenService` no rechazaba explícitamente un secret `None` ni una expiración menor o igual a cero.

## 3. Resultado de la auditoría

| Área | Estado | Evidencia |
| --- | --- | --- |
| Registro | IMPLEMENTADO | `POST /users/register`, schema, service y tests. |
| Passwords en texto plano | MITIGADO | Solo se persiste `password_hash`; `UserResponse` no lo expone. |
| Hashing | IMPLEMENTADO | `hashlib.scrypt`, salt aleatorio y `hmac.compare_digest`. |
| Hash corrupto | CORREGIDO | Base64 con `validate=True` y errores tratados como verificación falsa. |
| Login | IMPLEMENTADO | `POST /users/login`; email/password normalizados y validados. |
| Brute force básico | IMPLEMENTADO | Rate limiting por IP para login, HTTP 429. |
| JWT access token | IMPLEMENTADO | `sub`, `iat`, `exp`, algoritmo configurado. |
| Secret JWT ausente | CORREGIDO | `TokenService` falla con `RuntimeError` claro. |
| Expiración JWT inválida | CORREGIDO | Se exige entero mayor que cero. |
| Refresh token | NO IMPLEMENTADO | Fuera del alcance actual. |
| Current user | IMPLEMENTADO | Decode JWT y lookup del usuario. |
| Contrato de 401 Bearer | CORREGIDO | Envelope consistente y `WWW-Authenticate: Bearer`. |
| Ownership | IMPLEMENTADO | Favorites compara `user_id` con usuario autenticado. |
| Roles | NO IMPLEMENTADO | No existe modelo de roles. |
| SQL Injection | MITIGADO | `%s` para valores y whitelists de sort/period. |
| CORS | IMPLEMENTADO | Orígenes configurables, headers/métodos explícitos. |
| Rate limiting distribuido | NO IMPLEMENTADO | El limiter es por proceso y en memoria. |
| Secretos en Git | MITIGADO | `.env` ignorado y `.env.example` sin secretos reales. |
| Errores internos | PARCIAL | Handlers de dominio existen; no hay handler global de errores inesperados. |
| Logging | BÁSICO | CoinGecko todavía usa `print`; no hay logging estructurado. |
| Security headers | NO IMPLEMENTADO | No hay middleware dedicado para headers adicionales. |

## 4. Autenticación y autorización

### Autenticación

El flujo actual es:

```text
Authorization: Bearer <token>
        │
        ▼
HTTPBearer(auto_error=False)
        │
        ▼
TokenService.decode_access_token()
        │
        ▼
payload["sub"] → int
        │
        ▼
UserRepository.find_by_id()
        │
        ├── usuario → endpoint
        └── error   → 401 consistente
```

Los errores de autenticación ahora usan:

```json
{
  "detail": {
    "code": "authentication_required",
    "message": "Token Bearer requerido."
  }
}
```

El response incluye:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
```

Un token inválido, expirado o asociado a un usuario inexistente se representa como `invalid_access_token` sin revelar si el usuario existía.

### Autorización

La autorización actual no usa roles. Usa ownership directo:

```text
requested_user_id == current_user["id"]
```

Esto protege los cuatro endpoints de Favorites. Coins y Price History son públicos por decisión documentada porque representan datos de mercado.

## 5. Passwords

`PasswordHasher` mantiene el formato:

```text
scrypt$16384$8$1$<salt-base64>$<derived-key-base64>
```

Controles actuales:

- salt aleatorio de 16 bytes;
- `hashlib.scrypt` con `n=2**14`, `r=8`, `p=1`;
- no se guarda el password original;
- comparación con `hmac.compare_digest`;
- formato de algoritmo validado;
- base64 validado estrictamente;
- hash malformado devuelve `False`, no una excepción de infraestructura.

La validación de longitud del password ocurre en los request schemas, con 8–128 caracteres. El hasher es una utilidad interna y no reemplaza la validación HTTP.

## 6. JWT y secretos

`TokenService` genera access tokens con:

```json
{
  "sub": "<user_id>",
  "iat": "<issued-at>",
  "exp": "<expiration>"
}
```

El decode delega en PyJWT la firma, el algoritmo configurado y la expiración. No existen refresh tokens.

Se aplican dos validaciones tempranas:

- `JWT_SECRET_KEY` debe ser string de al menos 32 caracteres;
- `JWT_ACCESS_TOKEN_MINUTES` debe ser entero mayor que cero.

`.env` está excluido por `.gitignore`; `.env.example` documenta nombres, no valores reales. Nunca se imprimen settings ni tokens.

## 7. SQL Injection y entrada externa

Los repositories usan parámetros separados:

```python
cursor.execute(query, (coin_id,))
```

El SQL dinámico inevitable de `ORDER BY` no recibe valores libres. Se traduce mediante whitelists:

- `sort_by`: `recorded_at`, `price`;
- `sort_order`: `asc`, `desc`;
- `period`: `hour`, `day`, `week`.

Los schemas restringen body y query params. Los tests existentes verifican que un valor como `price; DROP TABLE price_history` produce `422` y no llega al controller.

La auditoría no confirma la existencia de constraints equivalentes en la base normal porque el repositorio no tiene DDL/migraciones versionadas.

## 8. CORS y rate limiting

M72 dejó:

- `allow_origins` desde `CORS_ALLOWED_ORIGINS`;
- métodos explícitos `GET`, `POST`, `DELETE`, `OPTIONS`;
- headers explícitos `Authorization`, `Content-Type`;
- `allow_credentials=False` porque se usan Bearer headers, no cookies;
- rate limit de login en ventana deslizante por IP;
- `Retry-After` y error `rate_limit_exceeded`.

Limitaciones conocidas:

- el limiter no coordina workers ni instancias;
- no hay límite general para todas las rutas;
- no se confía automáticamente en `X-Forwarded-For`;
- la IP de un proxy compartido puede agrupar muchos usuarios.

Para producción distribuida se necesitaría un almacenamiento compartido y una política explícita de proxies confiables. Redis no se introduce en este módulo porque todavía no existe esa necesidad en el proyecto educativo.

## 9. Errores y exposición de información

Controles positivos:

- `UserResponse` filtra `password_hash`;
- login usa el mismo mensaje para email inexistente y password incorrecto;
- token inválido no revela la causa exacta;
- errores de dominio se convierten en códigos estables;
- CORS no concede acceso a orígenes desconocidos;
- CoinGecko se traduce a 502 en lugar de propagar detalles internos del cliente HTTP.

Pendientes:

- errores inesperados no tienen un handler global dedicado;
- CoinGecko imprime mensajes en consola;
- el endpoint raíz contiene un mensaje con codificación dañada;
- no hay security headers adicionales como `X-Content-Type-Options` o `Referrer-Policy`.

No se debe añadir un handler genérico que devuelva tracebacks, paths o credenciales al cliente. Si se agrega en el futuro, debe registrar internamente y devolver un mensaje público estable.

## 10. Tests agregados

Unitarios en `app/tests/unit/test_authentication_security.py`:

- base64 inválido no rompe `PasswordHasher.verify()`;
- hash válido sigue verificando correctamente;
- secret JWT ausente es rechazado;
- expiración cero es rechazada.

API en `app/tests/api/test_authentication_contract.py`:

- ausencia de Bearer devuelve envelope consistente y `WWW-Authenticate`;
- token inválido devuelve `invalid_access_token` y `WWW-Authenticate`.

Comandos:

```powershell
python -m pytest app/tests/unit/test_authentication_security.py app/tests/api/test_authentication_contract.py
python -m pytest -q
python -m unittest discover -s app/tests -p "*_test.py"
```

## 11. Errores comunes

- Confundir autenticación (`401`) con autorización (`403`).
- Guardar passwords o tokens en logs.
- Permitir `CORS_ALLOWED_ORIGINS=*` sin analizar credenciales y exposición.
- Confiar en `X-Forwarded-For` sin conocer el proxy que lo escribe.
- Usar un rate limiter en memoria esperando que funcione entre varios workers.
- Concatenar `sort_by`, `sort_order` o `period` directamente en SQL.
- Devolver `password_hash` por olvidar un `response_model` seguro.
- Devolver detalles de JWT como “firma incorrecta” o “usuario inexistente”.

## 12. Alternativas y trade-offs

| Decisión actual | Alternativa | Trade-off |
| --- | --- | --- |
| Access JWT | Sessions almacenadas en DB | JWT evita lookup de sesión, pero revocar tokens es más difícil. |
| Rate limit en memoria | Redis/token bucket distribuido | Menos infraestructura ahora, menos escalabilidad. |
| Bearer header | Cookie HttpOnly | Bearer simplifica API; cookie requiere CSRF y política de sesión. |
| `scrypt` stdlib | Argon2/bcrypt | No agrega dependencia; otros algoritmos pueden tener ecosistema especializado. |
| Orígenes explícitos | `*` | Más seguro y controlable, menos cómodo para entornos desconocidos. |

## 13. Checklist

- [x] Auditar autenticación.
- [x] Auditar autorización y ownership.
- [x] Auditar passwords.
- [x] Auditar JWT y expiración.
- [x] Auditar SQL Injection.
- [x] Auditar CORS y rate limiting.
- [x] Auditar secretos.
- [x] Auditar validación de inputs.
- [x] Auditar exposición de errores.
- [x] Unificar errores de Bearer.
- [x] Agregar `WWW-Authenticate`.
- [x] Validar base64 estricto en hashes.
- [x] Validar secret y expiración JWT.
- [x] Crear tests de regresión.
- [x] Documentar riesgos pendientes.

## 14. Estado final

M73 queda implementado y verificado. La superficie de autenticación tiene un contrato 401 consistente, los hashes corruptos fallan cerradamente y la configuración JWT inválida se rechaza temprano.

La auditoría no elimina todas las tareas de seguridad del backend. Siguen pendientes logging estructurado, security headers, rate limiting distribuido, DDL/migraciones y el endpoint roto de Price History. El siguiente módulo educativo es M74 — índices y claves para consultas frecuentes.

