# Módulo 88 — Auth frontend

> **Estado:** CONTRATO DE AUTENTICACIÓN PREPARADO; UI PENDIENTE
> **Proyecto:** Crypto Tracker
> **Capa:** Sesión / Integración HTTP
> **Módulo anterior:** 87 — Integración frontend-backend
> **Siguiente módulo:** 89 — Errores en frontend

## 1. Alcance

Este módulo define cómo un cliente frontend debe usar la autenticación que ya
existe en el backend. La carpeta `frontend/` sigue vacía, por lo que no se
agregan componentes, rutas de navegación ni una estrategia específica de
React, Next.js o Vite.

El backend utiliza:

- registro con email, username y password;
- hashing `scrypt` en servidor;
- access token JWT Bearer;
- expiración configurable, 30 minutos por defecto;
- endpoint `/users/me` para recuperar el usuario autenticado;
- ownership en favoritos mediante el `user_id` del token;
- rate limiting en login por IP.

## 2. Flujo de sesión

```text
Formulario de registro
        ↓
POST /users/register
        ↓
Formulario de login
        ↓
POST /users/login
        ↓
Guardar access_token según política de seguridad
        ↓
GET /users/me con Authorization: Bearer <token>
        ↓
Estado autenticado del frontend
```

El frontend no debe crear hashes, firmar JWT ni inferir permisos. Esas
responsabilidades pertenecen al backend.

## 3. Registro

Request:

```json
{
  "username": "mateo",
  "email": "mateo@example.com",
  "password": "una-clave-segura"
}
```

Reglas del backend:

- `username`: entre 3 y 50 caracteres;
- `email`: entre 3 y 255 caracteres y se normaliza a minúsculas;
- `password`: entre 8 y 128 caracteres;
- campos adicionales: rechazados;
- el hash nunca vuelve en la respuesta.

Respuesta `201`:

```json
{
  "id": 1,
  "username": "mateo",
  "email": "mateo@example.com",
  "created_at": "2026-08-25T12:00:00"
}
```

Después de registrarse, el cliente puede llevar al usuario al login. El
registro no devuelve automáticamente un token.

## 4. Login

Request:

```json
{
  "email": "mateo@example.com",
  "password": "una-clave-segura"
}
```

Respuesta `200`:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

El cliente debe enviar el token únicamente como header:

```http
Authorization: Bearer <access_token>
```

No debe enviarlo como query parameter, body, cookie improvisada o log.

## 5. Estado de autenticación

El estado mínimo del cliente debería distinguir:

```text
loading
anonymous
authenticated(user, token)
expired
error
```

Al iniciar la aplicación:

1. leer el token según la política elegida;
2. si no existe, permanecer anónimo;
3. si existe, llamar a `GET /users/me`;
4. si responde `200`, establecer el usuario autenticado;
5. si responde `401`, eliminar el token y volver a anónimo;
6. no considerar válido un token solo porque tenga formato JWT.

`/users/me` consulta nuevamente el usuario en la base de datos. Por eso es la
fuente de verdad para la sesión, no el contenido decodificado en JavaScript.

## 6. Almacenamiento del token

El backend entrega un access token y no entrega refresh token. Hay dos opciones
principales:

### Token en memoria

Ventajas:

- menor persistencia ante XSS;
- cerrar pestaña elimina la sesión;
- simple de invalidar del lado cliente.

Desventaja:

- recargar la página obliga a iniciar sesión otra vez.

### `localStorage`

Ventaja:

- conserva la sesión entre recargas.

Riesgo:

- cualquier XSS que ejecute JavaScript en el origen puede intentar leerlo.

La elección debe hacerse cuando se conozca la arquitectura del frontend. Este
backend no impone una persistencia porque no existe refresh token ni cookie
HttpOnly configurada.

## 7. Logout

No existe un endpoint server-side de logout ni revocación de tokens. El logout
del cliente debe:

1. eliminar el access token del estado y del almacenamiento elegido;
2. eliminar el usuario actual;
3. limpiar datos privados en memoria o cache;
4. redirigir a la pantalla pública.

El JWT seguirá siendo criptográficamente válido hasta su expiración; por eso no
se debe presentar el logout local como revocación inmediata en el servidor.

## 8. Expiración y respuestas 401

El token contiene `iat`, `exp` y `sub`. El backend verifica firma, algoritmo,
expiración y existencia del usuario.

Ante `401`, el cliente debe diferenciar la experiencia visual, pero aplicar el
mismo flujo seguro:

```text
401 authentication_required
    → falta header Bearer

401 invalid_access_token
    → token inválido, expirado o usuario inexistente

401 invalid_credentials
    → email/password incorrectos durante login
```

Para `invalid_access_token`, limpiar la sesión y solicitar login nuevamente.
No reintentar infinitamente la misma request.

## 9. Rate limiting de login

El endpoint `POST /users/login` responde `429` cuando supera el límite por IP.
La respuesta incluye:

```http
Retry-After: <segundos>
```

El frontend debe mostrar un mensaje de espera y respetar ese header. No debe
ejecutar reintentos automáticos agresivos ni convertir un `429` en un supuesto
error de credenciales.

El límite actual es en memoria y por proceso; no representa un contador global
si la API se despliega con múltiples workers o instancias.

## 10. Protección de favoritos

El frontend debe enviar el `user_id` del usuario autenticado al consumir los
endpoints actuales, pero ese valor no constituye la autorización. El backend
compara el `user_id` solicitado con el `sub` del JWT.

Si no coinciden, responde `403`:

```json
{
  "detail": {
    "code": "forbidden",
    "message": "No tienes permiso para operar sobre este usuario."
  }
}
```

La UI no debe permitir cambiar manualmente el `user_id` de una operación propia
como mecanismo de seguridad. La validación real siempre ocurre en el backend.

## 11. CORS y headers

Para desarrollo local, el backend permite por defecto:

```text
http://localhost:3000
http://127.0.0.1:3000
```

La request de frontend debe incluir `Content-Type: application/json` en registro
y login, y `Authorization` en las rutas protegidas. El middleware también
expone `X-Request-ID`, útil para soporte y diagnóstico.

## 12. Checklist del flujo

- [x] Registro validado por Pydantic.
- [x] Password hasheada en backend con `scrypt`.
- [x] Login devuelve access token Bearer.
- [x] `/users/me` devuelve usuario sin `password_hash`.
- [x] JWT valida firma y expiración.
- [x] Ownership protegido en favoritos.
- [x] Rate limiting de login documentado.
- [ ] Elegir almacenamiento del token.
- [ ] Implementar provider/store de sesión en frontend.
- [ ] Implementar guardas de rutas.
- [ ] Diseñar UI de login, registro y sesión expirada.

## 13. Verificación

El contrato de autenticación está cubierto por pruebas API y unitarias:

```powershell
python -m pytest -q app/tests/api/test_authentication_contract.py app/tests/api/test_security_endpoints.py app/tests/unit/test_token_service.py app/tests/unit/test_authentication_security.py
```

La suite completa del backend debe seguir ejecutándose antes de implementar el
cliente real.

## 14. Estado final

M88 deja definido el flujo de sesión que deberá implementar el frontend. La
parte de código queda pendiente de elegir stack y crear el cliente en
`frontend/`; el backend no necesita cambios funcionales adicionales para este
contrato.
