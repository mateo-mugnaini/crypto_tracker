# Módulo 20 - Modelos de entidades

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

En este módulo creamos las representaciones Python de las tablas principales de la base de datos.

Los modelos permiten trabajar con objetos en lugar de manejar datos sueltos.

---

## ¿Qué es un modelo?

Un modelo es una clase que representa una entidad del sistema.

Ejemplo:

Tabla:

```
users
```

Modelo:

```
User
```

Ambos representan el mismo concepto desde distintas capas.

---

## Relación entre SQL y Python

Una tabla:

```
users

id
username
email
password_hash
created_at
```

Se convierte en:

```python
class User:

    def __init__(self):
        self.id
        self.username
        self.email
```

Cada columna pasa a ser un atributo.

---

## Modelo User

Representa a los usuarios registrados en la aplicación.

Contiene:

- identificador;
- nombre;
- email;
- contraseña almacenada como hash;
- fecha de creación.

---

## Modelo Favorite

Representa la relación entre un usuario y una moneda.

La tabla favorites funciona como una tabla intermedia.

Ejemplo:

```
User
 |
 |
Favorite
 |
 |
Coin
```

---

## Modelo PriceHistory

Representa el histórico de precios de una moneda.

Permite guardar valores en diferentes momentos:

Ejemplo:

```
bitcoin
60000
2026-08-07
```

---

## Separación de responsabilidades

Los modelos solamente representan información.

No deben encargarse de:

- consultar MySQL;
- llamar APIs;
- manejar lógica compleja.

Para eso existen otras capas.

---

## Arquitectura actual

```text
API

↓

Service

↓

Repository

↓

Model

↓

Database
```

Cada capa tiene una responsabilidad concreta.

---

## Beneficios

Esta separación permite:

- código más fácil de mantener;
- pruebas más simples;
- menos acoplamiento;
- mejor organización del proyecto.

Después de este módulo Python ya tiene una representación completa de las entidades principales de Crypto Tracker.
