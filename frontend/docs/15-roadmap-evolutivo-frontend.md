# Frontend 15 — Roadmap evolutivo de UX/UI y funcionalidades

> **Fecha de revisión:** 2026-08-26  
> **Baseline:** módulos Frontend 01 a 14 implementados  
> **Estado del módulo 15:** implementado y verificado localmente  
> **Objetivo:** evolucionar el MVP hacia una aplicación mantenible, medible y útil para el seguimiento personal de criptoactivos.

## Estado de implementación

- **Módulos 01–14:** implementados y documentados.
- **Módulos 15–16:** implementados: calidad, tests, CI, timeout, cancelación,
  validación de contratos y sincronización mercado-cartera.
- **Módulos 17–26:** planificados; todavía no implementados.

## 1. Diagnóstico actual

El frontend actual ya resuelve el flujo principal:

- registro, login y restauración de sesión;
- rutas públicas y protegidas;
- dashboard de mercado;
- favoritos por usuario;
- historial con filtros, estadísticas, paginación y gráfico;
- comparación normalizada entre dos monedas;
- cache compartido, refresco manual y polling resiliente;
- precio actual persistido por el backend;
- cartera no custodial con posiciones y rendimiento;
- responsive para desktop, tablet y mobile;
- acordeones mobile y estilos CSS Modules.

El producto está en una buena etapa de MVP. La deuda principal ya no está en
mostrar pantallas, sino en garantizar que la aplicación sea fácil de probar,
escalar y usar durante períodos largos.

## 2. Hallazgos técnicos

### Fortalezas

- TypeScript estricto en la aplicación.
- Cliente HTTP centralizado y `ApiError` propio.
- Contextos separados para autenticación, mercado, favoritos y cartera.
- Cache concurrente para evitar solicitudes duplicadas de `GET /coins`.
- Polling con pausa por visibilidad y backoff ante errores.
- Estados de carga, vacío y error presentes en los paneles principales.
- CSS Modules y tokens visuales compartidos.
- HTML semántico en formularios, tablas, botones y acordeones.

### Deuda y oportunidades

> La tabla de esta sección representa el diagnóstico inicial antes de comenzar
> los módulos 15 y 16. El estado actualizado de esos módulos se indica en cada
> sección correspondiente.

| Área            | Situación actual                                                                                  | Impacto                                                                    | Prioridad |
| --------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------- |
| Tests           | No hay script de tests, lint ni cobertura frontend                                                | Cambios visuales o funcionales pueden romper flujos existentes             | P0        |
| Validación real | El build está validado, pero falta una suite end-to-end con backend y scheduler                   | No se comprueba el producto completo como lo usa una persona               | P0        |
| Capa de datos   | Hay `fetch` centralizado, pero faltan cancelación de requests, timeout y validación de respuestas | Estados obsoletos, esperas indefinidas y errores difíciles de diagnosticar | P0        |
| Portfolio       | El valor actual no se refresca automáticamente con cada actualización del mercado                 | El usuario puede ver una valoración desactualizada                         | P0        |
| Navegación      | Un único dashboard concentra todas las secciones en anclas y acordeones                           | La aplicación será difícil de ampliar cuando existan más vistas            | P1        |
| Feedback        | Hay mensajes inline, pero no existe un sistema común de toast, skeleton, modal o confirmación     | Acciones importantes tienen poca continuidad visual                        | P1        |
| Mercado         | No hay búsqueda, orden, filtros ni detalle de una moneda                                          | Encontrar y analizar activos se vuelve lento con una lista grande          | P1        |
| Cartera         | Se registran posiciones agregadas, no operaciones individuales                                    | No se puede reconstruir coste, ventas, depósitos o rendimiento histórico   | P1        |
| Alertas         | No existe watchlist con umbrales ni centro de notificaciones                                      | El usuario debe abrir la aplicación para detectar cambios                  | P1        |
| Tiempo real     | Existe polling opcional, pero no SSE/WebSocket                                                    | El retraso depende del intervalo configurado                               | P2        |
| Accesibilidad   | Hay buenas bases, pero no auditoría automatizada ni navegación exhaustiva con teclado             | Riesgo de regresiones y barreras de uso                                    | P1        |
| Producción      | No hay pipeline, CSP definida, estrategia de despliegue ni observabilidad del cliente             | Operación y diagnóstico incompletos                                        | P1        |

## 3. Objetivos de la siguiente versión

1. Poder modificar el frontend con seguridad gracias a tests y validaciones
   automáticas.
2. Hacer que el usuario entienda siempre qué está cargando, qué se actualizó y
   qué debe hacer ante un error.
3. Mantener la interfaz usable desde 320 px hasta pantallas grandes sin perder
   información ni controles.
4. Convertir la cartera en un registro útil de operaciones, sin custodiar
   fondos ni claves privadas.
5. Preparar el producto para más monedas, más vistas y actualizaciones de
   mercado frecuentes.

## 4. Módulos propuestos

### Módulo 15 — Base de calidad y testing

**Prioridad:** P0  
**Dependencias:** ninguna.

Incorporar Vitest, React Testing Library, ESLint, Prettier y una ejecución
automática en CI.

**Alcance:**

- tests de `AuthContext`, `MarketContext`, `FavoritesContext` y
  `PortfolioContext`;
- tests del cliente HTTP y de la transformación de errores;
- tests de formularios, validaciones y estados loading/error/empty;
- tests de acordeones, botones y acciones críticas;
- cobertura mínima acordada para lógica, no para alcanzar un porcentaje
  artificial de líneas;
- scripts `test`, `test:watch`, `lint`, `format:check` y `typecheck`.

**Criterios de aceptación:**

- CI falla ante errores de TypeScript, lint o tests;
- registro, login, logout, favoritos y cartera tienen tests automatizados;
- los tests no dependen de CoinGecko ni de un backend real.

### Módulo 16 — Capa de datos resiliente

**Prioridad:** P0  
**Dependencias:** módulo 15.

**Estado:** implementado y verificado localmente.

Endurecer `api/client.ts` y los contextos sin introducir una librería de estado
innecesaria.

**Implementación realizada:**

- timeout por defecto de 10 segundos configurable con
  `VITE_API_TIMEOUT_MS`;
- cancelación mediante `AbortController` en autenticación, favoritos, cartera,
  historial y comparativa;
- clasificación de errores como red, timeout, cancelación, API o contrato;
- validación runtime de las respuestas principales del backend;
- invalidación explícita de la cache al forzar un refresco;
- sincronización de la cartera con `lastUpdated` del mercado;
- cancelación de requests hermanas cuando falla una carga compuesta de
  historial o comparativa.

**Alcance:**

- `AbortController` para cancelar requests al cambiar de moneda o desmontar
  una vista;
- timeout configurable para requests;
- distinguir cancelación, timeout, red, autenticación y error de contrato;
- validación runtime de las respuestas importantes;
- deduplicación y cache con política explícita de stale-while-revalidate;
- evitar que una respuesta anterior sobrescriba una selección nueva;
- centralizar la invalidación de mercado, historial y cartera;
- refrescar automáticamente la cartera cuando cambia el snapshot del mercado.

**Criterios de aceptación:**

- ninguna request queda activa al desmontar su consumidor;
- una respuesta tardía nunca reemplaza datos de una selección posterior;
- después de actualizar precios, mercado, historial, comparativa y cartera
  reflejan el mismo snapshot.

### Módulo 17 — Sistema de diseño y feedback de interacción

**Prioridad:** P1  
**Dependencias:** módulo 15.

Crear una pequeña capa de componentes reutilizables para que cada pantalla no
resuelva sus propios estados visuales.

**Componentes propuestos:**

- `Button` con variantes primary, secondary, ghost y danger;
- `Input`, `Select` y mensajes de campo;
- `Card`, `Badge` y `SectionHeader`;
- `Skeleton` para tarjetas, métricas, tablas y gráficos;
- `ToastRegion` para éxito, advertencia y error;
- `ConfirmDialog` para eliminar posiciones o acciones irreversibles;
- `EmptyState` y `ErrorState` comunes;
- tokens para espaciado, tamaños táctiles, z-index y breakpoints.

**Criterios de aceptación:**

- toda acción async tiene estado idle, loading, success y error;
- las operaciones destructivas requieren confirmación;
- los mensajes de éxito y error tienen `role="status"` o `role="alert"`
  según corresponda;
- ningún componente nuevo necesita copiar estilos base de botones o inputs.

### Módulo 18 — Navegación e información de arquitectura

**Prioridad:** P1  
**Dependencias:** módulos 15 y 17.

Preparar la interfaz para crecer más allá de un único dashboard con anclas.

**Alcance:**

- rutas `/dashboard`, `/market`, `/portfolio`, `/history` y `/compare`;
- mantener el dashboard como resumen y mover cada análisis a su propia vista;
- navegación mobile mediante drawer o bottom navigation accesible;
- conservar deep links y estado de filtros en la URL;
- abrir automáticamente una sección cuando se llega desde una navegación;
- sincronizar correctamente el estado activo con back/forward del navegador;
- preservar o restaurar la posición de scroll cuando corresponda.

**Criterios de aceptación:**

- cada sección se puede abrir y compartir mediante una URL directa;
- refrescar una URL interna no devuelve una pantalla rota;
- navegación con teclado y lector de pantalla identifica la vista activa;
- el dashboard sigue siendo una vista de resumen rápida.

### Módulo 19 — Explorador de mercado

**Prioridad:** P1  
**Dependencias:** módulos 16, 17 y 18.

Convertir el listado de monedas en una herramienta de exploración.

**Alcance:**

- búsqueda por nombre, símbolo o id;
- ordenar por nombre, ranking, precio y variación;
- filtros por favoritos, precio disponible y rango de ranking;
- selector de densidad: tarjetas o tabla en desktop;
- paginación o virtualización cuando el volumen lo requiera;
- vista de detalle de una moneda con precio actual, histórico, variación y
  acciones de favorito/cartera;
- estados claros para búsqueda sin resultados y datos incompletos.

**Criterios de aceptación:**

- la búsqueda no genera una request por cada tecla si no es necesario;
- los filtros se pueden combinar y conservar en la URL;
- una moneda sin precio sigue siendo identificable y no rompe la tarjeta;
- las acciones mantienen feedback inmediato y consistente.

### Módulo 20 — Cartera 2.0 y registro de operaciones

**Prioridad:** P1  
**Dependencias:** módulos 16, 17 y 19; requiere ampliar el contrato del backend.

Evolucionar la cartera agregada hacia un registro personal de operaciones. La
aplicación seguirá siendo no custodial: solo registra información declarada por
el usuario.

**Alcance:**

- operaciones de compra y venta;
- fecha, cantidad, precio, comisión y nota opcional;
- cálculo de coste medio y resultado realizado/no realizado;
- edición y eliminación con confirmación;
- distribución por activo y evolución del valor total;
- selector de moneda fiat y formato regional;
- importación CSV como etapa posterior;
- explicación visible de que no se conectan claves privadas ni fondos.

**Criterios de aceptación:**

- una operación se puede corregir sin perder consistencia histórica;
- el usuario distingue dinero invertido, valor actual y beneficio realizado;
- las cifras indican la moneda y el momento de actualización;
- los cálculos del frontend coinciden con el backend en casos conocidos.

### Módulo 21 — Alertas y centro de notificaciones

**Prioridad:** P1  
**Dependencias:** módulos 16, 19 y 20; requiere soporte de backend para alertas persistentes.

Permitir que el usuario defina qué cambios quiere vigilar.

**Alcance:**

- alerta cuando una moneda supera o cae por debajo de un precio;
- alerta porcentual respecto del último snapshot o del precio medio;
- activación, pausa y eliminación de alertas;
- centro de notificaciones leídas/no leídas;
- preferencias para evitar avisos repetidos;
- notificación visual dentro de la aplicación;
- email o push como etapas posteriores.

**Criterios de aceptación:**

- cada alerta muestra moneda, condición, valor alcanzado y fecha;
- una misma condición no genera notificaciones duplicadas en cada polling;
- el usuario puede desactivar todas las alertas desde preferencias.

### Módulo 22 — Actualización live con fallback

**Prioridad:** P2  
**Dependencias:** módulo 16 y soporte de backend.

Añadir Server-Sent Events o WebSocket para recibir nuevos snapshots sin que
cada cliente tenga que consultar constantemente. Mantener polling como
fallback cuando el canal no esté disponible.

**Alcance:**

- canal autenticado de eventos de mercado;
- reconexión con backoff y límite de intentos;
- indicador de conexión, última lectura y antigüedad del dato;
- fallback automático a polling;
- desconexión al ocultar la pestaña o cerrar sesión;
- actualización coordinada de mercado, historial, comparativa y cartera.

**Criterios de aceptación:**

- una actualización del backend llega una sola vez a cada consumidor;
- una caída del canal no bloquea la consulta manual;
- la interfaz informa si muestra datos en vivo, polling o datos antiguos.

### Módulo 23 — Analítica personal y visualizaciones avanzadas

**Prioridad:** P2  
**Dependencias:** módulo 20.

Agregar contexto para que el usuario pueda entender su comportamiento y no solo
ver precios.

**Alcance:**

- evolución del valor de cartera por período;
- rendimiento por activo y contribución al resultado;
- comparación contra BTC, ETH o un índice configurable;
- drawdown máximo y volatilidad descriptiva;
- rangos 24h, 7d, 30d, 90d y personalizado;
- tooltips accesibles y tabla equivalente a cada gráfico;
- exportación de reportes como CSV.

**Criterios de aceptación:**

- todo gráfico tiene una alternativa tabular;
- cada métrica explica fórmula, período y origen del dato;
- no se presentan cálculos como asesoramiento financiero.

### Módulo 24 — Accesibilidad y QA responsive

**Prioridad:** P1  
**Dependencias:** módulos 15, 17 y 18.

Convertir el responsive actual en una práctica verificable y no solo en reglas
CSS.

**Alcance:**

- Playwright en viewports 320, 360, 390, 768, 1024 y desktop;
- navegación completa con teclado;
- auditoría con axe;
- foco visible y orden de tabulación;
- contraste y tamaños táctiles mínimos;
- zoom al 200% y orientación horizontal;
- textos largos, nombres extensos y datos vacíos;
- preferencia de movimiento reducido;
- pruebas de acordeones, drawer, popup de ayuda, tablas y formularios.

**Criterios de aceptación:**

- cero overflow horizontal en los viewports soportados;
- no existen controles inaccesibles por teclado;
- cada input tiene etiqueta y error asociado;
- las acciones async anuncian su resultado a tecnologías asistivas.

### Módulo 25 — Seguridad, rendimiento y despliegue

**Prioridad:** P1  
**Dependencias:** módulos 15, 16 y 24.

Preparar el frontend para un entorno público.

**Alcance:**

- revisar estrategia de token y evaluar cookie `HttpOnly` con el backend;
- HTTPS, CORS y Content Security Policy en despliegue;
- validación de variables `VITE_*` al iniciar;
- source maps y datos sensibles fuera de logs;
- límites y mensajes de error sin filtrar información interna;
- lazy loading de vistas y reducción del bundle;
- pipeline de build, preview y despliegue reproducible;
- health check y registro de errores del cliente sin datos sensibles;
- política de dependencias y actualizaciones controladas.

**Criterios de aceptación:**

- el build de producción se ejecuta en CI desde un checkout limpio;
- no se exponen tokens, credenciales ni respuestas internas en la consola;
- las rutas protegidas no muestran información mientras se verifica la sesión;
- se dispone de una guía de rollback y configuración por ambiente.

### Módulo 26 — PWA y experiencia de uso prolongado

**Prioridad:** P2  
**Dependencias:** módulos 22, 24 y 25.

Mejorar la experiencia para usuarios que consultan el tracker con frecuencia.

**Alcance:**

- instalación como aplicación web progresiva;
- cache controlada de shell y última lectura, sin cachear datos privados de
  forma insegura;
- pantalla offline informativa;
- recuperación después de volver a conectarse;
- preferencias de tema, moneda y densidad;
- atajos de teclado en desktop;
- última vista y filtros restaurables.

**Criterios de aceptación:**

- offline no se confunde con datos en vivo;
- la aplicación informa la antigüedad de cualquier dato cacheado;
- cerrar y abrir la aplicación conserva solo las preferencias permitidas.

## 5. Orden recomendado de ejecución

```text
15 Calidad y testing
        ↓
16 Capa de datos resiliente ───┐
        ↓                      │
17 Sistema de diseño           │
        ↓                      │
18 Navegación escalable        │
        ↓                      │
19 Explorador de mercado       │
        ↓                      │
20 Cartera 2.0                 │
        ↓                      │
21 Alertas                     │
        ↓                      │
22 Live + fallback             │
        ↓                      │
23 Analítica avanzada          │
                               │
24 QA responsive y accesibilidad
        ↓
25 Seguridad, rendimiento y despliegue
        ↓
26 PWA y experiencia prolongada
```

La secuencia práctica recomendada para comenzar es **15 → 16 → 17 → 18**.
Después se puede elegir entre profundizar mercado con el módulo 19 o cartera
con el módulo 20. Los módulos 21 a 23 deben esperar a que exista un modelo de
datos estable para no construir experiencias sobre cálculos incompletos.

## 6. Definición de terminado para cada módulo

Un módulo se considera terminado cuando cumple todos estos puntos:

- implementación integrada en la estructura actual de `src/`;
- estados de carga, vacío, error y éxito cubiertos;
- responsive probado en los viewports definidos;
- accesibilidad básica verificada;
- tests de la lógica nueva y del flujo crítico;
- documentación actualizada;
- `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build`
  correctos;
- contrato de backend documentado si el módulo agrega endpoints o campos.

## 7. Estado de referencia

Los módulos 01 a 14 están documentados como verificados o implementados. Este
documento no afirma que los módulos 15 a 26 estén construidos: define el trabajo
posterior y sus condiciones de aceptación.

El frontend puede seguir utilizándose como MVP mientras se ejecuta este
roadmap. La prioridad inmediata es reducir el riesgo de regresiones y corregir
la sincronización de la cartera antes de sumar analítica o tiempo real.
