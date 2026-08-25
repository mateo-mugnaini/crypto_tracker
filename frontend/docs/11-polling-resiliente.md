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

El mecanismo continúa consultando datos mediante `GET /coins`. Con el
scheduler del backend habilitado, puede reflejar los nuevos registros después
de cada ciclo; el frontend no crea esos registros.

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- La integración del precio actual se documenta en el módulo 12.
- La verificación end-to-end con scheduler y frontend levantados queda como
  siguiente bloque de validación.
