# Crypto Tracker — Frontend

Frontend inicial de Crypto Tracker con React, TypeScript y Vite.

## Estado

Este primer módulo incluye:

- scaffolding Vite + React + TypeScript;
- cliente HTTP centralizado;
- configuración `VITE_API_BASE_URL`;
- login contra `POST /users/login`;
- restauración de sesión mediante `GET /users/me`;
- token guardado en `sessionStorage`;
- registro de usuarios contra `POST /users/register`;
- navegación entre login y registro;
- rutas públicas y protegidas con React Router;
- cierre de sesión automático ante una respuesta `401`;
- dashboard inicial con `GET /coins`;
- manejo de errores de red y del contrato del backend.

Todavía no incluye favoritos, historial ni gráficos. Se
agregarán en módulos sucesivos.

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
npm run build
```

El build ejecuta TypeScript en modo build y luego genera los assets de Vite.

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
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.module.css
│   │   ├── RegisterForm.tsx
│   │   └── RegisterForm.module.css
│   └── dashboard/
│       ├── CoinsPanel.tsx
│       ├── CoinsPanel.module.css
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
[`docs/02-registro-y-navegacion.md`](docs/02-registro-y-navegacion.md) y
[`docs/03-rutas-y-sesion.md`](docs/03-rutas-y-sesion.md).
