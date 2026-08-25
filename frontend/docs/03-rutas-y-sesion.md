# Frontend 03 — Rutas públicas, protegidas y sesión expirada

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Stack:** React + TypeScript + Vite + React Router

## Objetivo

Formalizar la navegación del frontend y centralizar la reacción ante tokens
inválidos o expirados.

## Rutas

| Ruta | Tipo | Pantalla |
| --- | --- | --- |
| `/login` | Pública | Login |
| `/register` | Pública | Registro |
| `/dashboard` | Protegida | Dashboard |
| `/` | Redirección | Login o dashboard según sesión |

Las rutas públicas redirigen a `/dashboard` si ya existe una sesión válida.
Las rutas protegidas redirigen a `/login` cuando la sesión es anónima.

## Sesión expirada

El cliente HTTP registra un callback global para respuestas `401`. Cuando la
API rechaza el token, `AuthContext` limpia `sessionStorage`, elimina el usuario
actual y cambia el estado a `anonymous`. El guard de rutas completa la
redirección a `/login`.

```text
Request con Bearer
  ↓
API responde 401
  ↓
AuthContext.logout()
  ↓
status = anonymous
  ↓
ProtectedRoute → /login
```

## Estructura

```text
src/
├── routes/
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
├── auth/AuthContext.tsx
├── api/client.ts
└── main.tsx
    └── BrowserRouter
```

## Verificación

```powershell
npm install
npm run build
```

Resultado: dependencia instalada, TypeScript correcto y build de Vite
completado correctamente.

## Próximo módulo

- Layout compartido para dashboard.
- Favoritos conectados al usuario autenticado.
- Estados de carga y error por sección.
