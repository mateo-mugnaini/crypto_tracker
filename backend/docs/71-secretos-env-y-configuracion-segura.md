# Módulo 71 — Secretos, `.env` y configuración segura

## Resultado

- `.env` está ignorado por Git; no se versionan credenciales ni JWT secrets.
- `.env.example` sí se versiona y documenta las variables requeridas sin valores reales.
- `TokenService` exige una `JWT_SECRET_KEY` de al menos 32 caracteres para HS256.

## Uso

```powershell
Copy-Item .env.example .env
```

Después se reemplazan los valores de ejemplo por secretos locales. Cada entorno (development, test, production) debe tener una clave JWT distinta.

## Regla

Nunca incluir `.env`, passwords MySQL, tokens, claves privadas o dumps de base en Git, logs o documentación.

## Tests

`TokenService` se prueba con una clave válida y con una clave corta rechazada.

## Siguiente

M72 — CORS, rate limiting y abuso de API.
