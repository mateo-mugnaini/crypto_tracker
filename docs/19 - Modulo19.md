# Módulo 19 - Relaciones entre Python y Base de Datos (Modelos + Repository)

> ### Objetivo:
>
> - Saber que es un Modelo de Datos.
> - Por qué usamos clases Python para representar tablas.
> - Cómo mapear una tabla SQL a un objeto Python.
> - Cómo organizar modelos dentro del proyecto.
> - Cómo preparar los repositories para las nuevas tablas.

### ESTADO ACTUAL:

```shell
crypto_tracker
├── users
├── coins
├── favorites
└── price_history
```

Pero Python todavía no sabe qué es un `User`, un `Favorite` o un `PriceHistory`

Necesitamos crear una representación en código.

---

### ¿Qué es un modelo?

Un modelo representa una entidad de nuestro sistema.

