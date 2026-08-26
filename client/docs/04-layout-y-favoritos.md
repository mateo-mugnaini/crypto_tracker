# Frontend 04 — Layout del dashboard y favoritos

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Backend consumido:** `/favorites`, `/favorites/details`

## Objetivo

Conectar los favoritos del usuario autenticado y darles una representación
visible dentro del dashboard sin duplicar reglas de ownership del backend.

## Incluido

- Tipos frontend para favoritos simples y detallados.
- Métodos autenticados en `api/client.ts`:
  - `GET /favorites/details?user_id={id}`;
  - `POST /favorites`;
  - `DELETE /favorites/{coin_id}?user_id={id}`.
- `FavoritesContext` como estado compartido de la sesión autenticada.
- Carga inicial de favoritos del usuario actual.
- Toggle de favorito desde cada moneda del mercado.
- Panel de favoritos con eliminación individual.
- Estados de carga, vacío, actualización y error.
- Layout de dashboard con mercado y favoritos como secciones independientes.

## Seguridad

Cada request envía el Bearer de `AuthContext` y utiliza el `user.id` obtenido
desde `GET /users/me`. El frontend no permite seleccionar otro usuario: el
backend continúa siendo responsable de validar ownership y devolver `403` si
la identidad no coincide.

## Flujo

```text
AuthContext
  ↓ user.id + token
FavoritesContext
  ↓
GET /favorites/details
  ↓
Dashboard
  ├── CoinsPanel → POST/DELETE /favorites
  └── FavoritesPanel → DELETE /favorites
```

## Estructura

```text
src/
├── api/
│   ├── client.ts
│   └── types.ts
├── features/
│   └── favorites/
│       └── FavoritesContext.tsx
├── components/dashboard/
│   ├── CoinsPanel.tsx
│   ├── FavoritesPanel.tsx
│   └── Topbar.tsx
└── pages/dashboard/
    └── DashboardPage.tsx
```

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Visualización gráfica del historial.
- Comparación entre monedas.
