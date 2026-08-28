# Pulso — cliente web

Cliente alternativo de Pulso construido desde cero con React, JavaScript, Vite y CSS Modules. Comparte el backend con `frontend`, pero tiene una experiencia propia y deliberadamente mínima.

## Qué hace

- inicia y cierra sesión contra el backend;
- muestra un resumen breve en Inicio;
- permite buscar monedas y consultar su detalle;
- guarda favoritos y actualiza precios;
- registra posiciones personales de una cartera no custodial;
- conserva Historial, Comparar y Alertas como herramientas secundarias;
- aprovecha el cache, polling opcional y stream live ya implementados en `MarketContext`.

La navegación principal tiene solamente tres destinos: Inicio, Mercado y Cartera. Las herramientas que requieren más contexto se encuentran en `Más` y no compiten con el recorrido principal.

## Requisitos

- Node.js 20.19 o superior;
- backend disponible en `http://127.0.0.1:8000`.

## Instalación y ejecución

Desde esta carpeta:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

La aplicación queda disponible normalmente en `http://localhost:5173`.

Para usar otra API, definí `VITE_API_BASE_URL` en `.env`. Las variables `VITE_*` son públicas y no deben contener secretos.

## Verificación

```powershell
npm run check
```

Ese comando ejecuta Prettier, ESLint, los 23 tests existentes con cobertura y el build de Vite.

## Estructura de la nueva experiencia

```text
src/
├── api/                         cliente HTTP y contratos
├── auth/                        sesión compartida
├── features/                    estado de mercado, cartera, favoritos y alertas
├── routes/                      protección de rutas
├── pulse/                       nueva interfaz de Pulso
│   ├── PulseShell.jsx           shell y navegación principal
│   ├── PulseAuth.jsx            acceso y registro simplificados
│   ├── PulseHome.jsx            inicio con resumen y siguientes acciones
│   ├── PulseMarket.jsx          búsqueda y listado de mercado
│   ├── PulseCoinDetail.jsx      detalle contextual de una moneda
│   ├── PulsePortfolio.jsx       cartera esencial
│   └── PulseTools.jsx           favoritos, historial, comparación y alertas
└── App.jsx                      providers y rutas
```

Los componentes antiguos permanecen en el repositorio para no perder cobertura ni referencias históricas, pero `App.jsx` ya no los utiliza en el recorrido nuevo.

## Rutas

## Idiomas

Pulso incluye traducciones locales para italiano, espanol e ingles, sin API de
traduccion. Italiano es el idioma predeterminado. El selector esta disponible
en la experiencia principal y la preferencia se conserva en `localStorage` con
la clave `crypto_tracker_locale`.

La implementacion vive en `src/i18n/I18nContext.jsx` y los componentes usan
`useI18n().t("clave")`.

| Ruta              | Uso                      |
| ----------------- | ------------------------ |
| `/login`          | iniciar sesión           |
| `/register`       | crear cuenta             |
| `/dashboard`      | Inicio                   |
| `/market`         | buscar monedas           |
| `/market/:coinId` | detalle de una moneda    |
| `/portfolio`      | cartera                  |
| `/favorites`      | favoritos                |
| `/history`        | historial de precios     |
| `/compare`        | comparación              |
| `/alerts`         | alertas y notificaciones |

El plan de producto y las decisiones de simplificación están documentados en [`UX_REDESIGN_PLAN.md`](UX_REDESIGN_PLAN.md).
