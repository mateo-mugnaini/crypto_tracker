# QA responsive y accesibilidad

Esta guía convierte el módulo 24 del roadmap en una verificación repetible. La
aplicación ya incorpora foco visible, targets táctiles de al menos 42 px en los
controles compartidos, asociación de etiquetas/ayudas/errores, estados
asíncronos anunciables y soporte para `prefers-reduced-motion`.

## Viewports soportados

Ejecutar la revisión con el navegador en estos anchos:

| Ancho | Caso | Qué revisar |
| ---: | --- | --- |
| 320 px | móvil pequeño | ningún corte, formulario en una columna y textos largos |
| 360 px | móvil habitual | acordeones, ayuda como botón y navegación inferior |
| 390 px | móvil grande | tarjetas, tablas desplazables y acciones agrupadas |
| 768 px | tablet | cambio entre navegación móvil/desktop y grids |
| 1024 px | notebook compacta | sidebar, formularios y encabezados |
| 1440 px | desktop | límites de ancho, popup de ayuda y orden visual |

## Checklist funcional

- [ ] No aparece overflow horizontal en ningún viewport soportado.
- [ ] Todos los controles se alcanzan con `Tab` y el foco siempre es visible.
- [ ] `Shift + Tab` recorre los controles en sentido inverso.
- [ ] Los acordeones se abren y cierran con `Enter` o `Space`.
- [ ] El popup de ayuda se abre con el botón y se cierra con `Escape`.
- [ ] El diálogo de confirmación enfoca Cancelar al abrir, retiene el foco y lo
      devuelve al botón que lo abrió al cerrar.
- [ ] Los formularios muestran una etiqueta asociada y el error se anuncia sin
      depender únicamente del color.
- [ ] Las cargas anuncian estado y las operaciones terminadas muestran un toast
      con `role="status"` o `role="alert"`.
- [ ] Los estados vacíos, nombres extensos y mensajes de error no rompen el
      layout.

## Variantes de visualización

Repetir la checklist con:

1. zoom del navegador al 200%;
2. orientación horizontal en móvil/tablet;
3. movimiento reducido activado en el sistema;
4. datos sin precio, cartera vacía, alertas sin notificaciones y filtros sin
   resultados;
5. una moneda o usuario con un nombre suficientemente largo para envolver
   varias líneas.

## Comandos de verificación local

Desde `frontend/`:

```bash
pnpm run format:check
pnpm run typecheck
pnpm run lint
pnpm run test -- --run
pnpm run build
```

Para una revisión manual, iniciar la aplicación con `pnpm run dev`, abrir la
URL indicada por Vite y usar las herramientas de responsive del navegador.

## Cobertura y límite actual

Los tests de Vitest cubren la lógica de teclado del diálogo, la ayuda y la
asociación de campos. El repositorio todavía no incluye Playwright ni
`axe-core`; por eso la matriz de viewport y la auditoría automática del árbol
de accesibilidad deben incorporarse como siguiente inversión de QA E2E, sin
considerar esas herramientas instaladas hasta que se agreguen explícitamente a
las dependencias.
