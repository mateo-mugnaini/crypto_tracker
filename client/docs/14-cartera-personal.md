# Frontend 14 — Cartera personal

> **Estado:** IMPLEMENTADO Y VERIFICADO LOCALMENTE

## Objetivo

Permitir que el usuario registre posiciones manuales y vea el rendimiento
estimado de su cartera sin custodiar fondos ni claves privadas.

## Incluido

- formulario de moneda, cantidad y precio medio de compra;
- actualización de una posición existente por moneda;
- resumen de capital invertido, valor actual y resultado;
- tabla de posiciones con rendimiento y peso de cartera;
- eliminación de posiciones;
- estados vacío, loading y error;
- navegación propia desde el sidebar.

## Flujo

```text
PortfolioPanel
      ↓
PortfolioContext
      ↓ Bearer token
GET/POST/DELETE /portfolio
      ↓
Backend calcula current_value, P&L y allocation
```

La cartera utiliza el precio más reciente disponible en `price_history`. Si no
existe un precio, la posición conserva sus datos de compra y muestra `Sin datos`
para los valores dependientes del mercado.

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.
