# Frontend 11 — Polling resiliente

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Componente:** `MarketContext`

## Objetivo

Evitar consultas periódicas innecesarias cuando la pestaña no está visible y
reducir la presión sobre la API cuando el backend presenta errores temporales.

## Incluido

- Reemplazo de `setInterval` por un ciclo cancelable con `setTimeout`.
- Pausa automática cuando `document.visibilityState` es `hidden`.
- Reanudación inmediata al volver a la pestaña.
- Backoff progresivo después de errores: `2×`, `4×` y hasta `8×` del intervalo
  configurado.
- Reinicio del backoff después de una respuesta exitosa.
- Limpieza del timer y listener al desmontar `MarketProvider`.

## Comportamiento

```text
Respuesta exitosa → intervalo configurado
Primer error      → 2 × intervalo
Segundo error     → 4 × intervalo
Tercer error      → 8 × intervalo máximo
Pestaña oculta    → sin requests
Pestaña visible   → refresco inmediato
```

El mecanismo continúa consultando datos existentes mediante `GET /coins`. No
crea registros de precios y no reemplaza el scheduler del backend.

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Integrar el polling con registros creados por el scheduler del backend.
- Revisar pruebas de comportamiento temporal con fake timers.
