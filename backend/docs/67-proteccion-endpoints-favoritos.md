# Módulo 67 — Protección de endpoints de favoritos

Todos los endpoints de favoritos ahora dependen de `get_current_user`. Sin JWT válido devuelven `401`.

El usuario autenticado se entrega a cada route mediante `Depends`, manteniendo la autenticación fuera de services y repositories.

## Tests

- API tests de favoritos actualizados con usuario autenticado inyectado.
- Suite completa: 127 tests aprobados.

## Siguiente

M68 — autorización y ownership.
