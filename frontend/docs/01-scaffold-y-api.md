# Frontend 01 — Scaffold, API y sesión inicial

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Stack:** React + TypeScript + Vite
> **Backend consumido:** FastAPI en `http://127.0.0.1:8000`
> **Siguiente módulo:** Frontend 03 — Rutas protegidas y navegación formal

## Objetivo

Crear una base frontend real, conectada al backend existente, sin duplicar
reglas de negocio ni inventar contratos HTTP.

## Incluido

- Vite + React + TypeScript.
- `VITE_API_BASE_URL` para configurar la API.
- Cliente `fetch` centralizado en `src/api/client.ts`.
- Tipos HTTP en `src/api/types.ts`.
- Normalización básica de errores y `X-Request-ID`.
- Login contra `POST /users/login`.
- Registro contra `POST /users/register`.
- Validación de sesión mediante `GET /users/me`.
- Token temporal en `sessionStorage`.
- Dashboard inicial con `GET /coins`.
- Diseño responsive sin dependencia visual externa.

## Flujo actual

```text
Login
  ↓
POST /users/login
  ↓
sessionStorage
  ↓
GET /users/me
  ↓
Dashboard
  ↓
GET /coins
```

Si el backend devuelve `401`, el frontend limpia la sesión. Los errores de red
y del contrato `detail.code` se convierten en `ApiError`.

## Archivos principales

```text
frontend/
├── src/api/client.ts
├── src/api/types.ts
├── src/auth/AuthContext.tsx
├── src/components/
│   ├── auth/
│   │   ├── LoginForm.tsx + LoginForm.module.css
│   │   ├── RegisterForm.tsx + RegisterForm.module.css
│   │   └── ...
│   └── dashboard/
│       ├── CoinsPanel.tsx + CoinsPanel.module.css
│       └── Topbar.tsx + Topbar.module.css
├── src/pages/
│   ├── auth/
│   │   ├── LoginPage.tsx + LoginPage.module.css
│   │   └── RegisterPage.tsx + RegisterPage.module.css
│   └── dashboard/
│       └── DashboardPage.tsx + DashboardPage.module.css
├── src/App.tsx + App.module.css
├── src/main.tsx
├── .env.example
└── package.json
```

La UI está separada en `pages/` y `components/`: las páginas componen
pantallas completas y los componentes encapsulan piezas reutilizables; ambos
están agrupados por área funcional (`auth/`, `dashboard/`). Los estilos viven
junto al módulo que los utiliza mediante CSS Modules (`*.module.css`).

## Comandos verificados

```powershell
npm install
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
```

Resultados:

- `npm run build`: correcto;
- TypeScript: correcto;
- Vite: inició correctamente;
- smoke test `GET /`: `200` y HTML con `#root`.

## Decisiones

- Se eligió Vite porque el proyecto necesita una SPA que consume una API ya
  existente.
- Se eligió `sessionStorage` para no persistir el JWT más allá de la sesión del
  navegador; esta decisión puede cambiar cuando exista refresh token.
- El cliente HTTP vive fuera de los componentes para centralizar headers,
  errores y URL base.
- La pantalla inicial usa el backend real, no mocks.

## Pendiente

- Registro de usuarios.
- React Router y rutas públicas/protegidas formales.
- Favoritos.
- Historial, filtros y paginación.
- Gráficos.
- Tests del frontend.
- Decidir si agregar una librería de estado o data fetching.
