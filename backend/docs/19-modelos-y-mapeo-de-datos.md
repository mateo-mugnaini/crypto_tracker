# Módulo 19 - Modelos y mapeo de datos

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

En este módulo comenzamos a conectar la estructura de la base de datos con el código Python.

Creamos modelos que representan las entidades del sistema.

---

## ¿Qué es un modelo?

Un modelo es una representación en código de una entidad del sistema.

Una tabla SQL representa datos almacenados.

Un modelo Python representa esos mismos datos dentro de la aplicación.

---

## Ejemplo

Tabla:

```text
coins

id
symbol
name
market_cap_rank
```

Modelo:

```python
class Coin:
    id
    symbol
    name
    market_cap_rank
```

Ambos representan el mismo concepto desde diferentes capas.

---

## ¿Por qué utilizar clases?

Las clases permiten:

- definir estructuras claras;
- evitar errores de escritura;
- agrupar comportamiento relacionado;
- mejorar la legibilidad del código.

---

## Separación de responsabilidades

La arquitectura queda:

```text
Database

↓

Repository

↓

Model

↓

Service
```

Cada capa tiene una responsabilidad específica.

---

## Método **str**

Python utiliza `__str__` para definir cómo debe mostrarse un objeto cuando usamos:

```python
print(objeto)
```

Esto mejora la lectura durante pruebas y debugging.

---

## Beneficios

Trabajar con modelos permite:

- código más organizado;
- mejor mantenimiento;
- menos dependencia directa de SQL;
- facilidad para evolucionar la aplicación.

---

## Estado del proyecto

Después de este módulo:

- MySQL contiene las tablas.
- Python tiene objetos que representan esas tablas.
- Los repositories podrán convertir datos SQL en objetos Python.

Este patrón es utilizado en la mayoría de aplicaciones backend profesionales.
