# Frontend 02 — Registro y navegación de autenticación

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Stack:** React + TypeScript + Vite
> **Backend consumido:** `POST /users/register`

## Objetivo

Agregar el alta de usuarios usando el contrato real del backend y permitir que
una persona navegue entre login y registro desde la zona pública.

## Incluido

- Método `api.register(username, email, password)`.
- `RegisterForm` dentro de `components/auth/`.
- `RegisterPage` dentro de `pages/auth/`.
- Validación local de confirmación de password.
- Validaciones HTML alineadas con el backend: username de 3 a 50 caracteres
  y password de 8 a 128 caracteres.
- Mensajes de error normalizados mediante `ApiError`.
- Confirmación visual después de un registro exitoso.
- Navegación pública login → registro y registro → login, preparada para el
  router formal incorporado en el módulo siguiente.

## Flujo

```text
LoginPage
  ↓ Crear una cuenta
RegisterPage
  ↓ POST /users/register
Confirmación
  ↓
LoginPage
```

El registro no inicia sesión automáticamente porque el backend devuelve el
usuario creado, no un token. La persona vuelve al login y obtiene su JWT por el
flujo existente de `POST /users/login`.

## Estructura

```text
src/
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       └── *.module.css
└── pages/
    └── auth/
        ├── LoginPage.tsx
        ├── RegisterPage.tsx
        └── *.module.css
```

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Favoritos.
- Historial y gráficos.
