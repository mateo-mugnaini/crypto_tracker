# Pulso — Frontend

Cliente de Pulso con React, JavaScript, Vite y CSS Modules. La aplicación concentra
mercado, cartera, favoritos y alertas en una experiencia de seguimiento clara.

## Estado

La aplicación cuenta con autenticación, dashboard de mercado, favoritos,
historial, comparación de monedas y un sistema visual fintech responsive.

- scaffolding Vite + React + JavaScript;
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
- sistema UI compartido para botones, campos, alertas, skeletons, estados vacíos,
  toasts y confirmaciones de acciones destructivas.
- vistas navegables para resumen, mercado, cartera, favoritos, historial y comparativa;
  cada una puede abrirse directamente mediante su propia URL.
- explorador de mercado con búsqueda local, filtros, ordenamiento, vista de tabla
  y detalle individual de moneda.
- cartera 2.0 con registro de compras y ventas, comisiones, notas, edición,
  eliminación confirmada y métricas de beneficio realizado/no realizado.

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
npm run lint
npm run format:check
npm test
npm run build
```

El build genera los assets optimizados de Vite.
La cobertura se puede consultar con `npm run test:coverage`.

`VITE_API_TIMEOUT_MS` controla el tiempo máximo de espera de cada request y usa
`10000` ms si no se define. Las consultas dependientes de una vista pueden
cancelarse con `AbortController` sin mostrar falsos errores al usuario.

## Arquitectura

```text
src/
├── api/
│   ├── client.js          requests, auth header y ApiError
│   └── types.js           contratos HTTP
├── auth/
│   └── AuthContext.jsx    sesión y usuario actual
├── routes/
│   ├── ProtectedRoute.jsx  guard de rutas autenticadas
│   └── PublicRoute.jsx     guard de rutas públicas
├── features/
│   ├── market/
│   │   └── MarketContext.jsx estado/cache del mercado
│   └── favorites/
│       └── FavoritesContext.jsx estado compartido de favoritos
├── components/
│   ├── ui/                 componentes visuales y feedback compartidos
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── LoginForm.module.css
│   │   ├── RegisterForm.jsx
│   │   └── RegisterForm.module.css
│   └── dashboard/
│       ├── CoinsPanel.jsx
│       ├── CoinsPanel.module.css
│       ├── FavoritesPanel.jsx
│       ├── FavoritesPanel.module.css
│       ├── PriceHistoryPanel.jsx
│       ├── PriceHistoryPanel.module.css
│       ├── PriceHistoryChart.jsx
│       ├── PriceHistoryChart.module.css
│       ├── PriceComparisonPanel.jsx
│       ├── PriceComparisonPanel.module.css
│       ├── ComparisonChart.jsx
│       ├── ComparisonChart.module.css
│       ├── Topbar.jsx
│       └── Topbar.module.css
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── LoginPage.module.css
│   │   ├── RegisterPage.jsx
│   │   └── RegisterPage.module.css
│   └── dashboard/
│       ├── DashboardPage.jsx
│       └── DashboardPage.module.css
├── App.jsx                composición raíz y rutas
├── App.module.css         estilos globales mínimos
└── main.jsx               entrypoint React
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

## Calidad, seguridad y despliegue

Ejecuta `npm run check` para correr formato, lint, tests con
cobertura y build en una sola operacion. En produccion define
`VITE_API_BASE_URL` con una URL absoluta de la API. Las variables `VITE_*` son
publicas y nunca deben contener secretos.

La guia de QA responsive y accesibilidad esta en
[`docs/16-qa-responsive-accessibility.md`](docs/16-qa-responsive-accessibility.md).
La guia de seguridad, rendimiento y despliegue esta en
[`docs/17-seguridad-rendimiento-despliegue.md`](docs/17-seguridad-rendimiento-despliegue.md).
Con el backend corriendo, `npm run healthcheck` verifica el endpoint local de
salud.

La PWA y su prueba offline local estan documentadas en
[`docs/18-pwa-local.md`](docs/18-pwa-local.md).
