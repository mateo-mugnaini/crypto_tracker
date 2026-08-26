# Plan de rediseño UX de Pulso

> Documento de auditoría y planificación. Esta fase describe el problema y la
> solución propuesta; no implementa todavía la nueva arquitectura.

## Alcance y criterio

La auditoría se realizó sobre el código real de `client/src`. El cliente es una
aplicación React con Vite y JavaScript que consume un único backend existente.
El objetivo no es sumar capacidades, sino reducir la cantidad de decisiones que
debe tomar un usuario para consultar el mercado, entender una moneda y llevar
un registro personal.

Se mantienen como restricciones:

- contratos y endpoints del backend;
- autenticación y protección de rutas;
- actualización automática, polling y stream de mercado ya existentes;
- persistencia de cartera, favoritos y alertas;
- React, Vite, JavaScript y CSS Modules;
- una única arquitectura de componentes, sin duplicar el frontend.

## A. Diagnóstico actual

### Lo que funciona

- La sesión se resuelve en `AuthContext` y se conserva en `sessionStorage`.
- `ProtectedRoute` y `PublicRoute` separan correctamente las áreas autenticada y
  pública.
- `MarketContext` centraliza monedas, cache de 30 segundos, refresco manual,
  polling y stream live con fallback.
- `PortfolioContext`, `FavoritesContext` y `AlertsContext` evitan que cada
  pantalla implemente su propia carga y mutación.
- Existen estados de loading, error, vacío, toast, offline y error boundary.
- El detalle de una moneda conserva el contexto del activo y permite actualizar,
  guardar en favoritos y navegar hacia la cartera.

### Problema principal

La aplicación expone muchas capacidades con el mismo peso visual. El usuario
debe entender una estructura de producto antes de poder completar una tarea.
La interfaz actual se parece más a un panel de herramientas que a un asistente
de seguimiento personal.

Las fricciones más importantes son:

1. La navegación expone siete destinos autenticados al mismo nivel: resumen,
   mercado, cartera, favoritos, historial, comparativa y alertas.
2. El dashboard concentra resumen, cartera, monedas y favoritos. Aunque las
   herramientas de análisis ya están separadas del inicio, la cartera continúa
   siendo un módulo grande con posiciones y operaciones.
3. Mercado tiene búsqueda, orden, dirección, ranking, favoritos, disponibilidad
   de precio, densidad de tarjetas/tabla y actualización individual. Son útiles,
   pero no todos son necesarios para empezar a explorar.
4. Historial combina selección de moneda, fechas, rango de precios, orden,
   estadísticas, tabla, gráfico y paginación en una misma superficie.
5. Cartera mezcla alta rápida de posición, registro de operaciones, edición,
   eliminación, tablas y resultados. La diferencia entre “posición” y
   “operación” no queda suficientemente explicada para un usuario nuevo.
6. Hay acciones equivalentes repetidas: refresco global, actualización por
   moneda, actualización desde el detalle y formularios de cartera presentes en
   más de un contexto.
7. El encabezado, el estado de sincronización y la navegación ocupan espacio en
   todas las pantallas, pero no siempre ayudan a decidir la siguiente acción.
8. La navegación móvil convierte todos los destinos en una tira horizontal. Es
   funcional, pero obliga a recorrer opciones secundarias para encontrar las
   principales.
9. Las pantallas secundarias tienen buena capacidad analítica, pero no una
   jerarquía suficientemente explícita entre acción principal, filtros y
   resultado.

## B. Mapa actual

### Rutas públicas

```text
/login
└── LoginPage

/register
└── RegisterPage
```

### Rutas protegidas

```text
ProtectedRoute
└── DashboardLayout
    ├── /dashboard
    │   └── DashboardPage
    ├── /market
    │   └── MarketPage → MarketExplorer
    ├── /market/:coinId
    │   └── CoinDetailPage → PriceHistoryPanel
    ├── /portfolio
    │   └── PortfolioPage → PortfolioPanel + PortfolioAnalyticsPanel
    ├── /favorites
    │   └── FavoritesPage → FavoritesPanel
    ├── /history
    │   └── HistoryPage → PriceHistoryPanel
    ├── /compare
    │   └── ComparePage → PriceComparisonPanel
    └── /alerts
        └── AlertsPage → AlertsPanel
```

### Capas globales

```text
ErrorBoundary
└── OfflineNotice
    └── AuthProvider
        └── ToastProvider
            └── FavoritesProvider
                └── MarketProvider
                    └── PortfolioProvider
                        └── AlertsProvider
                            └── AppContent
```

### Navegación actual

`Topbar` duplica la navegación para desktop y mobile. En desktop presenta
sidebar, identidad de usuario, alertas, refresco y salida. En mobile presenta un
header sticky y una tira horizontal con las siete rutas.

## C. Fricciones y oportunidades

| Fricción                              | Impacto                                                 | Oportunidad UX                                                                  |
| ------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Siete destinos principales            | El usuario no sabe por dónde comenzar                   | Reducir la navegación primaria a Inicio, Mercado y Cartera                      |
| Favoritos como destino independiente  | Separa una acción de seguimiento de su contexto natural | Mostrar favoritos en Inicio y Mercado; conservar la ruta como acceso secundario |
| Comparar como destino principal       | Es una herramienta de análisis, no el objetivo inicial  | Moverla a “Más herramientas”                                                    |
| Formulario de historial expuesto      | Demasiadas decisiones antes de ver datos                | Mostrar moneda y período; agrupar filtros avanzados                             |
| Posición y operación juntas           | Confunde el modelo financiero                           | Acción inicial “Agregar posición”; operaciones en una sección avanzada          |
| Actualizaciones repetidas             | El usuario no distingue refresco global de individual   | Un refresco global visible y actualización individual contextual                |
| Detalle sin continuidad explícita     | El usuario puede no saber qué hacer después             | Acciones claras: guardar, agregar a cartera, ver historial y volver a Mercado   |
| Tira mobile extensa                   | Baja descubribilidad de destinos importantes            | Navegación mobile de tres destinos y menú “Más”                                 |
| Mensajes técnicos o poco orientativos | El error no siempre indica el siguiente paso            | Mensajes con causa breve y una única acción recomendada                         |

## D. Clasificación de funcionalidades

### Nivel 1 — Primarias

- consultar y buscar monedas;
- abrir el detalle de una moneda;
- ver el precio actual y su contexto;
- registrar y consultar la cartera;
- actualizar los datos del mercado;
- acceder al resumen personal.

### Nivel 2 — Secundarias

- guardar y revisar favoritos;
- consultar historial de precios;
- crear y gestionar alertas;
- ver operaciones de la cartera;
- actualizar una moneda concreta.

### Nivel 3 — Terciarias

- comparar dos monedas;
- analítica avanzada de cartera;
- benchmark y período configurable;
- exportar CSV;
- filtros por ranking, rango de precios, dirección y densidad de resultados;
- tabla de operaciones y edición/eliminación de registros.

La clasificación no elimina capacidades: determina cuándo aparecen y cuánto
compiten por la atención.

## E. Nueva arquitectura propuesta

### Navegación mental

```text
Pulso
├── Inicio
│   ├── Estado del mercado
│   ├── Resumen de cartera
│   ├── Favoritos recientes
│   └── Acciones rápidas
├── Mercado
│   ├── Búsqueda simple
│   ├── Resultados
│   └── Detalle de moneda
├── Cartera
│   ├── Resumen de valor y resultado
│   ├── Agregar posición
│   ├── Posiciones actuales
│   └── Operaciones y analítica avanzada
└── Más
    ├── Historial
    ├── Alertas
    └── Comparar
```

### Arquitectura técnica de presentación

```text
App
├── PublicArea
│   ├── LoginPage
│   └── RegisterPage
└── ProtectedAppShell
    ├── PrimaryNavigation
    ├── PageHeader
    ├── InicioPage
    │   ├── MarketStatus
    │   ├── PortfolioSummary
    │   ├── FavoritePreview
    │   └── QuickActions
    ├── MercadoPage
    │   ├── MarketSearch
    │   ├── MarketResults
    │   └── CoinDetailPage
    ├── CarteraPage
    │   ├── PortfolioSummary
    │   ├── HoldingForm
    │   ├── HoldingsList
    │   └── AdvancedPortfolioTools
    └── SecondaryTools
        ├── HistoryPage
        ├── AlertsPage
        └── ComparePage
```

No se propone crear una segunda capa de estado. Los contextos actuales siguen
siendo la fuente de verdad. La nueva arquitectura es de navegación y
presentación.

### Decisiones de navegación

- Mantener las URLs actuales para no romper enlaces ni contratos.
- Retirar `/favorites`, `/history`, `/compare` y `/alerts` de la navegación
  primaria, no eliminarlas.
- Exponer esas rutas desde un menú secundario y enlaces contextuales.
- Mantener `/market/:coinId` para conservar el detalle compartible.
- Mantener `DashboardLayout`, pero convertirlo en un shell más liviano y con
  una acción contextual por pantalla.

## F. Flujos principales

### 1. Primer acceso

**Actual**

```text
/login → completar email/contraseña → validar sesión → /dashboard
```

**Propuesto**

```text
/login → completar credenciales → Inicio con orientación inmediata
```

Se mantienen los mismos pasos técnicos. Cambia la claridad del primer destino.

### 2. Consultar una moneda

**Actual**

```text
Inicio → Mercado → buscar/filtrar → Ver detalle → actualizar o favorito
```

**Propuesto**

```text
Inicio → Mercado → buscar → resultado con acciones contextuales
```

El detalle continúa disponible cuando se necesita más contexto, pero no es un
paso obligatorio para guardar una moneda o actualizar su precio.

### 3. Registrar una posición

**Actual**

```text
Inicio o Cartera → Posición rápida → elegir moneda → cantidad → precio medio → guardar
```

**Propuesto**

```text
Inicio → Agregar posición → datos esenciales → guardar → resumen actualizado
```

La operación detallada queda detrás de “Registrar operación” para no competir
con el alta básica.

### 4. Revisar favoritos

**Actual**

```text
Inicio → Favoritos → revisar selección
```

**Propuesto**

```text
Inicio → Favoritos recientes → ver todos si hace falta
```

La ruta `/favorites` se conserva como acceso secundario.

### 5. Crear una alerta

**Actual**

```text
Inicio → Alertas → moneda → condición → precio objetivo → Crear alerta
```

**Propuesto**

```text
Inicio → Crear alerta → moneda + condición + precio → Guardar alerta
```

El formulario seguirá pidiendo los datos necesarios, pero mostrará una única
acción principal y feedback inmediato.

### 6. Consultar historial

**Actual**

```text
Inicio → Historial → moneda → seis filtros posibles → aplicar → tabla/gráfico
```

**Propuesto**

```text
Mercado → Detalle → Historial de esta moneda
                         └── período visible → filtros avanzados opcionales
```

La ruta global de historial seguirá existiendo para análisis independiente.

## G. Decisión por pantalla

| Pantalla          | Decisión                                             | Justificación                                                     |
| ----------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Login             | Mantener y simplificar                               | Es un flujo corto; debe tener una sola acción primaria            |
| Registro          | Mantener y simplificar                               | Reducir ruido informativo y mantener validación clara             |
| Dashboard/Inicio  | Reemplazar composición                               | Debe orientar tareas, no listar todas las capacidades             |
| Mercado           | Simplificar                                          | Búsqueda primero; filtros y densidad después                      |
| Detalle de moneda | Mantener y reforzar                                  | Es el centro contextual para actuar sobre un activo               |
| Cartera           | Mantener y dividir por prioridad                     | Alta rápida visible; operaciones y analítica progresivas          |
| Favoritos         | Mantener como función, quitar de navegación primaria | Es seguimiento contextual, no un espacio de trabajo independiente |
| Historial         | Mantener como herramienta secundaria                 | Tiene valor, pero no para el primer contacto                      |
| Comparar          | Mantener como herramienta terciaria                  | Requiere datos y decisión analítica previa                        |
| Alertas           | Mantener como secundaria                             | Es una acción puntual que puede iniciarse desde Inicio o Mercado  |

No se elimina ninguna pantalla en la primera fase. Se reduce su importancia
visual y se mejora el punto desde el que se accede.

## H. Componentes

### Reutilizar

- `Button`, `Field`, `Badge`, `Alert`, `EmptyState`, `Skeleton`;
- `ToastProvider`, `ConfirmDialog`, `OfflineNotice`;
- `MarketContext`, `PortfolioContext`, `FavoritesContext` y `AlertsContext`;
- `DashboardLayout` como shell común;
- gráficos existentes, sin duplicar visualizaciones.

### Refactorizar

- `Topbar`: dividir navegación primaria y secundaria; un solo modelo de links;
- `DashboardPage`: convertirlo en Inicio orientado a tareas;
- `CoinsPanel`/`MarketExplorer`: separar búsqueda, resultados y filtros avanzados;
- `PortfolioPanel`: separar posición básica de operaciones;
- `PriceHistoryPanel`: aplicar divulgación progresiva a filtros;
- `CoinDetailPage`: añadir acciones contextuales y retorno claro;
- mensajes de loading, error y vacío para que cada uno recomiende un siguiente paso.

### Componentes redundantes o a revisar

- duplicación de navegación desktop/mobile en `Topbar`;
- posibles encabezados repetidos de paneles que podrían compartir un patrón;
- `HelpTag` debe conservarse solo donde explique un concepto real, no como
  decoración o sustituto de una etiqueta clara;
- no se propone agregar una librería de componentes ni una nueva dependencia.

## I. Responsive

### Desktop

- sidebar compacta con solo Inicio, Mercado y Cartera;
- menú “Más” para funciones secundarias;
- contenido con una columna principal y módulos de apoyo, evitando paneles de
  igual jerarquía;
- formularios y tablas con acciones alineadas al contexto.

### Tablet

- navegación primaria siempre visible;
- herramientas secundarias en menú desplegable;
- formularios de cartera en dos columnas como máximo;
- filtros avanzados en sección plegable.

### Mobile

- barra inferior o header compacto con tres destinos primarios;
- “Más” como una acción única y fácil de encontrar;
- una acción primaria por pantalla;
- cards de moneda con precio, favorito y acción principal en la misma unidad;
- tablas transformadas en tarjetas legibles, no en scroll horizontal obligatorio;
- formularios esenciales primero y campos avanzados plegables;
- paneles largos como acordeones solo cuando reduzcan realmente la carga visual.

## J. Roadmap de implementación

### Fase 0 — Auditoría y base

- aprobar este documento;
- definir el nombre final y decidir si la identidad visual actual se conserva;
- establecer un inventario de rutas y acciones que no pueden romperse;
- no cambiar backend.

### Fase 1 — Shell y navegación

- crear `ProtectedAppShell` o adaptar `DashboardLayout`;
- reducir navegación primaria a Inicio, Mercado y Cartera;
- agrupar herramientas secundarias;
- resolver navegación mobile;
- mantener aliases y URLs existentes.

### Fase 2 — Inicio orientado a tareas

- reemplazar widgets secundarios por resumen y acciones rápidas;
- mostrar favoritos y cartera como previews contextuales;
- eliminar duplicaciones de actualización visibles;
- verificar loading, vacío, error y refresh.

### Fase 3 — Mercado y detalle

- búsqueda como control principal;
- filtros avanzados bajo divulgación progresiva;
- acciones de moneda visibles sin entrar obligatoriamente al detalle;
- detalle con retorno, favorito, cartera e historial claramente ordenados.

### Fase 4 — Cartera progresiva

- alta básica de posición como flujo principal;
- operaciones y analítica detrás de secciones secundarias;
- mejorar ayuda contextual y confirmaciones;
- preservar todos los endpoints actuales.

### Fase 5 — Herramientas secundarias

- simplificar historial;
- mantener alertas con una acción primaria;
- mover comparación y exportación a herramientas avanzadas;
- unificar patrones de feedback.

### Fase 6 — Responsive y calidad

- revisar desktop, tablet y mobile;
- comprobar autenticación, permisos, routing y navegación directa;
- ejecutar tests, lint y build después de cada fase;
- añadir tests de navegación y acciones principales donde falten.

## K. Métricas de simplificación

Las siguientes cifras son aproximadas y se basan en la estructura actual del
código. No representan llamadas HTTP: representan pantallas o decisiones de
interfaz que el usuario debe atravesar.

| Flujo                    |             Pantallas actuales |         Pantallas propuestas |  Interacciones actuales | Interacciones propuestas |
| ------------------------ | -----------------------------: | ---------------------------: | ----------------------: | -----------------------: |
| Consultar precio         |           2 (Inicio → Mercado) |        1 principal (Mercado) |       2–4 según filtros |                      1–2 |
| Abrir contexto de moneda | 3 (Inicio → Mercado → Detalle) |        2 (Mercado → Detalle) |                     3–5 |                      2–3 |
| Guardar favorito         |     2–3 según punto de entrada |                          1–2 |                     2–4 |                      1–2 |
| Agregar posición         |                            1–2 |                            1 |     4–6 campos/acciones |       3–4 datos/acciones |
| Crear alerta             |                              2 |                 1 contextual |                     4–5 |                      3–4 |
| Revisar historial        |                            2–3 |                            2 | 5–8 decisiones posibles |            2–4 al inicio |
| Comparar monedas         |       2 (Comparar → resultado) | 2, en herramienta secundaria |                     3–5 |                      3–5 |

### Profundidad

- profundidad máxima de ruta actual: dos segmentos en `/market/:coinId`, más
  overlays contextuales en confirmaciones;
- profundidad máxima propuesta: se conserva en URL para compatibilidad, pero se
  reduce la profundidad mental al acceder desde Mercado y desde enlaces
  contextuales;
- destinos primarios actuales: 7;
- destinos primarios propuestos: 3;
- herramientas secundarias: 4 agrupadas bajo un único acceso.

## L. Back-end

No se detecta una necesidad inmediata de cambiar el backend para ejecutar este
rediseño. Las mejoras propuestas utilizan los datos y endpoints ya consumidos:

- mercado y actualización de precios;
- detalle e historial;
- favoritos;
- cartera, posiciones y operaciones;
- analítica y exportación;
- alertas y notificaciones.

Si una fase posterior demuestra que una acción contextual necesita una respuesta
agregada nueva, se documentará antes de tocar contratos. La modificación mínima
probable sería un endpoint de resumen, pero no forma parte de esta auditoría ni
se implementa ahora.

## Pendientes deliberados

- no se elimina todavía ninguna ruta;
- no se cambia el modelo de datos de cartera;
- no se cambia autenticación, permisos ni refresco live;
- no se incorporan dependencias nuevas;
- no se considera completada ninguna mejora UX hasta verificar el flujo real con
  tests y navegación.
