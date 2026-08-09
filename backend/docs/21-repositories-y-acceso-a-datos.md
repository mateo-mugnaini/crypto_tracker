# Módulo 21 - Repositories y acceso a datos

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

En este módulo creamos la capa Repository.

Esta capa permite separar el código que maneja la base de datos del resto de la aplicación.

---

## ¿Qué es un Repository?

Un Repository es una clase responsable de comunicarse con la base de datos.

Su función es:

- guardar datos;
- buscar datos;
- actualizar datos;
- eliminar datos.

---

## ¿Por qué separar esta lógica?

Sin Repository tendríamos SQL mezclado dentro de los servicios.

Ejemplo incorrecto:

```python
def create_user():
    INSERT INTO users
```

Esto genera código difícil de mantener.

---

## Arquitectura

La aplicación queda:

```text
Service

↓

Repository

↓

Database
```

Cada capa tiene una responsabilidad.

---

## UserRepository

Administra operaciones relacionadas con usuarios.

Ejemplo:

```python
user_repository.save(user)
```

convierte un objeto Python en un INSERT SQL.

---

## FavoriteRepository

Administra la relación entre usuarios y monedas favoritas.

La tabla favorites utiliza una clave primaria compuesta:

```
(user_id, coin_id)
```

Esto evita duplicados.

---

## PriceHistoryRepository

Guarda los valores históricos de las monedas.

Permite almacenar:

- moneda;
- precio;
- fecha del registro.

---

## Beneficios

Separar repositories permite:

- código más organizado;
- pruebas más simples;
- cambiar la base de datos en el futuro;
- reutilizar operaciones.

---

## Flujo completo

```text
Usuario

↓

Service

↓

Repository

↓

MySQL
```

El Repository es el puente entre Python y la base de datos.
