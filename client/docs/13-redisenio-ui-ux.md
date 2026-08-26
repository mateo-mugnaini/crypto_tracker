# Frontend 13 — Rediseño integral UI/UX

> **Estado:** IMPLEMENTADO Y VERIFICADO LOCALMENTE

## Dirección visual

Se reemplazó la estética anterior por una identidad fintech/crypto sobria:

- fondo azul noche `#07111F`;
- superficies escalonadas `#0B1728`, `#102033` y `#162A40`;
- cyan tecnológico como color primario;
- verde reservado para señales positivas;
- rosa para errores y variaciones negativas;
- bordes sutiles, sombras contenidas y radios consistentes.

Los tokens viven en `src/App.module.css` y se consumen desde todos los CSS
Modules para evitar colores y espaciados arbitrarios.

## Layout y navegación

- Sidebar persistente en desktop.
- Header compacto en tablet y mobile.
- Navegación por secciones del dashboard: resumen, mercado, favoritos,
  historial y comparativa.
- Estado activo visible y foco de teclado conservado.
- Acciones de actualización y cierre de sesión disponibles en el shell.

## Pantallas rediseñadas

- Login y registro con layout dividido, copy de producto y formularios de alto
  contraste.
- Dashboard con resumen de activos, precios disponibles y estado de
  sincronización.
- Cards de mercado y favoritos con hover sutil y jerarquía de datos.
- Historial con filtros, estadísticas, tabla, paginación y gráfico.
- Comparación normalizada con selectores, variaciones y gráfico.

## Responsive y accesibilidad

- Breakpoints para desktop, tablet y mobile.
- Grids que se reorganizan sin ocultar información relevante.
- Tablas con overflow horizontal controlado.
- `focus-visible`, labels semánticos, `aria-label` en acciones e iconos
  decorativos ocultos para lectores de pantalla.
- Soporte de `prefers-reduced-motion`.

## Alcance funcional

No se modificaron endpoints, autenticación, Context API, routing ni reglas de
negocio. El rediseño trabaja sobre la presentación y conserva las llamadas
existentes al backend.

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente. No existe script de lint
configurado actualmente en `package.json`.
