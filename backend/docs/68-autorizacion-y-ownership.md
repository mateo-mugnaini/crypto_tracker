# Módulo 68 — Autorización y ownership

Autenticación responde “quién eres”; autorización responde “qué puedes hacer”.

Los endpoints de favoritos comprueban que `user_id` coincida con `current_user["id"]`. Si no coincide, lanzan `ForbiddenOperationException`, que FastAPI traduce a HTTP `403` con código `forbidden`.

Esto evita que un token válido pueda leer, crear o eliminar favoritos de otro usuario manipulando `user_id`.

## Verificación

- Caso ownership incorrecto: HTTP 403.
- API tests relevantes: 18 aprobados.
- Suite completa Pytest: 127 aprobados.

## Siguiente

M69 — Protección y revisión de endpoints.
