# Módulo 25 - Sincronización inteligente y actualización de registros

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

En este módulo aprendimos a sincronizar información de forma segura, evitando errores por registros duplicados.

La estrategia consiste en comprobar si un registro ya existe antes de decidir si debe insertarse o actualizarse.

---

## El problema de los duplicados

Cuando una moneda ya existe en la base de datos, intentar insertarla nuevamente produce un error de clave primaria.

Ejemplo:

```text
Duplicate entry 'bitcoin' for key 'PRIMARY'
```

Esto ocurre porque el identificador de la moneda ya está almacenado en la tabla.

---

## Método exists()

Se incorpora un método que consulta si una moneda existe.

Su función es devolver:

- `True` si el registro está presente.
- `False` si no existe.

Este método utiliza una consulta `SELECT COUNT(*)`.

---

## Método update()

También se agrega un método `update()` al Repository.

Su responsabilidad es modificar los datos de una moneda existente utilizando una consulta `UPDATE`.

El Repository no decide cuándo actualizar; simplemente ejecuta la operación solicitada.

---

## Nueva responsabilidad del Service

El Service pasa a contener la lógica de decisión.

El flujo queda:

```text
Obtener datos

↓

Convertir a Coin

↓

¿Existe?

├── Sí → update()

└── No → save()
```

De esta forma la lógica de negocio permanece en la capa Service.

---

## Separación de responsabilidades

- **Service:** decide qué operación realizar.
- **Repository:** ejecuta la operación sobre la base de datos.
- **Database:** administra la conexión con MySQL.

Cada capa mantiene una única responsabilidad.

---

## Ventajas

- Evita errores por claves duplicadas.
- Permite sincronizar datos múltiples veces.
- Mantiene una arquitectura limpia y desacoplada.
- Facilita futuras mejoras en la estrategia de persistencia.

---

## Próximo paso

En el siguiente módulo optimizaremos este proceso y comenzaremos a trabajar con la actualización del historial de precios de las criptomonedas, incorporando nuevas reglas de negocio.
