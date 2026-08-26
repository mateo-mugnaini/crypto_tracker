# Crypto Tracker — Frontend

Frontend de Crypto Tracker con React, TypeScript, Vite y CSS Modules.

## Estado

La aplicación cuenta con autenticación, dashboard de mercado, favoritos,
historial, comparación de monedas y un sistema visual fintech responsive.

- scaffolding Vite + React + TypeScript;
- cliente HTTP centralizado;
- configuración `VITE_API_BASE_URL`;
- timeout configurable de API mediante `VITE_API_TIMEOUT_MS`;
- login contra `POST /users/login`;
- restauración de sesión mediante `GET /users/me`;
- token guardado en `sessionStorage`;
- registro de usuarios contra `POST /users/register`;
- navegación entre login y registro;
- rutas públicas y protegidas con React Router;
- cierre de sesión automático ante una respuesta `401`;
- dashboard inicial con `GET /coins`;
- favoritos propios con listado, alta y baja;
- historial de precios con filtros, estadísticas, paginación y gráfico SVG;
- comparación normalizada entre dos monedas;
- cache compartido del mercado y refresco manual del dashboard;
- actualización manual del precio por moneda;
- polling opcional del mercado configurable por entorno;
- polling consciente de visibilidad y con backoff ante errores;
- precio actual de cada moneda obtenido desde el último registro de historial;
- cartera personal no custodial con posiciones y rendimiento;
- manejo de errores de red y del contrato del backend.

El rediseño visual integral está documentado en
[`docs/13-redisenio-ui-ux.md`](docs/13-redisenio-ui-ux.md).

## Requisitos

- Node.js 20.19 o superior.
- Backend levantado en `http://127.0.0.1:8000`.

## Instalación

Desde esta carpeta:

```powershell
npm install
Copy-Item .env.example .env
```

## Ejecución

```powershell
npm run dev
```

La aplicación estará disponible normalmente en `http://localhost:5173`.

## Verificación

```powershell
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

El build ejecuta TypeScript en modo build y luego genera los assets de Vite.
La cobertura se puede consultar con `npm run test:coverage`.

`VITE_API_TIMEOUT_MS` controla el tiempo máximo de espera de cada request y usa
`10000` ms si no se define. Las consultas dependientes de una vista pueden
cancelarse con `AbortController` sin mostrar falsos errores al usuario.

## Arquitectura

```text
src/
├── api/
│   ├── client.ts          requests, auth header y ApiError
│   └── types.ts           contratos HTTP
├── auth/
│   └── AuthContext.tsx    sesión y usuario actual
├── routes/
│   ├── ProtectedRoute.tsx  guard de rutas autenticadas
│   └── PublicRoute.tsx     guard de rutas públicas
├── features/
│   ├── market/
│   │   └── MarketContext.tsx estado/cache del mercado
│   └── favorites/
│       └── FavoritesContext.tsx estado compartido de favoritos
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.module.css
│   │   ├── RegisterForm.tsx
│   │   └── RegisterForm.module.css
│   └── dashboard/
│       ├── CoinsPanel.tsx
│       ├── CoinsPanel.module.css
│       ├── FavoritesPanel.tsx
│       ├── FavoritesPanel.module.css
│       ├── PriceHistoryPanel.tsx
│       ├── PriceHistoryPanel.module.css
│       ├── PriceHistoryChart.tsx
│       ├── PriceHistoryChart.module.css
│       ├── PriceComparisonPanel.tsx
│       ├── PriceComparisonPanel.module.css
│       ├── ComparisonChart.tsx
│       ├── ComparisonChart.module.css
│       ├── Topbar.tsx
│       └── Topbar.module.css
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── LoginPage.module.css
│   │   ├── RegisterPage.tsx
│   │   └── RegisterPage.module.css
│   └── dashboard/
│       ├── DashboardPage.tsx
│       └── DashboardPage.module.css
├── App.tsx                composición raíz y rutas
├── App.module.css         estilos globales mínimos
└── main.tsx               entrypoint React
```

Las páginas representan pantallas y componen componentes reutilizables. Cada
área funcional tiene su propia carpeta dentro de `pages/` y `components/`. Cada
componente o página mantiene sus estilos en un archivo `*.module.css`, evitando
colisiones de clases y facilitando la evolución visual por módulo.

El frontend consume el contrato documentado en `backend/docs/87-92` y no
duplica reglas de autenticación ni de negocio del backend.

La documentación está en [`docs/01-scaffold-y-api.md`](docs/01-scaffold-y-api.md),
[`docs/02-registro-y-navegacion.md`](docs/02-registro-y-navegacion.md),
[`docs/03-rutas-y-sesion.md`](docs/03-rutas-y-sesion.md) y
[`docs/04-layout-y-favoritos.md`](docs/04-layout-y-favoritos.md) y
[`docs/05-historial-y-filtros.md`](docs/05-historial-y-filtros.md) y
[`docs/06-grafico-historial.md`](docs/06-grafico-historial.md) y
[`docs/07-comparacion-monedas.md`](docs/07-comparacion-monedas.md) y
[`docs/08-cache-y-refresco.md`](docs/08-cache-y-refresco.md) y
[`docs/09-actualizacion-manual-precios.md`](docs/09-actualizacion-manual-precios.md) y
[`docs/10-polling-opcional.md`](docs/10-polling-opcional.md) y
[`docs/11-polling-resiliente.md`](docs/11-polling-resiliente.md).
La etapa de precio actual está documentada en
[`docs/12-precio-actual.md`](docs/12-precio-actual.md).
La cartera está documentada en
[`docs/14-cartera-personal.md`](docs/14-cartera-personal.md).

El roadmap evolutivo, con la auditoría técnica y los módulos propuestos para
la siguiente etapa, está en
[`docs/15-roadmap-evolutivo-frontend.md`](docs/15-roadmap-evolutivo-frontend.md).
