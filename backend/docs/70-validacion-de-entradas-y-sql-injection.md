# Módulo 70 — Validación de entradas y SQL Injection

## Resultado de auditoría

Los valores externos de repositories usan placeholders `%s` y parámetros separados. No se concatenan IDs, emails, precios ni fechas en SQL.

`ORDER BY` y agregaciones requieren SQL dinámico; se protegen con whitelists:

- columnas: `recorded_at`, `price`;
- dirección: `asc`, `desc`;
- periodos: `hour`, `day`, `week`.

## Test de seguridad

Se añadió una prueba API que envía `sort_by=price; DROP TABLE price_history`. La API responde 422 y el controller no se invoca.

## Decisión

Nunca se intenta “escapar” manualmente un valor externo. Los valores se parametrizan; los identificadores SQL inevitables se transforman desde listas permitidas.

## Siguiente

M71 — secretos, `.env` y configuración segura.
