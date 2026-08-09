# Módulo 16 - Repository Pattern y persistencia de datos

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## ¿Qué problema resuelve un Repository?

Un Repository es una capa que separa el acceso a datos del resto de la aplicación.

Sin Repository, cualquier archivo podría contener SQL:

```text
main.py

├── conexión MySQL
├── consultas SQL
├── lógica de negocio
└── presentación
```

Esto hace que el código sea difícil de mantener.

---

## Arquitectura con Repository

La arquitectura queda:

```text
main.py

↓

Service

↓

Repository

↓

Database

↓

MySQL
```

Cada capa tiene una responsabilidad.

---

## Responsabilidad del Repository

Un Repository se encarga de:

- Crear consultas SQL.
- Insertar información.
- Buscar información.
- Actualizar registros.
- Eliminar registros.

No debe encargarse de:

- Mostrar información.
- Consumir APIs externas.
- Tomar decisiones de negocio.

---

## Modelos de datos

Creamos modelos utilizando `dataclass`.

Un modelo representa una entidad del sistema.

Ejemplo:

```python
Coin(
    id="bitcoin",
    symbol="btc",
    name="Bitcoin"
)
```

Esto es más claro que trabajar con diccionarios.

---

## ¿Qué es dataclass?

`dataclass` es una funcionalidad de Python que simplifica la creación de clases utilizadas para almacenar datos.

Automáticamente genera:

- constructor;
- representación del objeto;
- métodos de comparación.

---

## Parámetros SQL

Nunca debemos concatenar valores directamente:

Incorrecto:

```python
query = "SELECT * FROM coins WHERE id=" + coin_id
```

Esto puede provocar SQL Injection.

La forma correcta es utilizar parámetros:

```python
cursor.execute(
    query,
    values
)
```

---

## ON DUPLICATE KEY UPDATE

Esta instrucción permite actualizar datos si la clave primaria ya existe.

Ejemplo:

Si bitcoin ya existe:

```text
bitcoin
btc
Bitcoin
```

MySQL actualiza sus valores.

Esto evita duplicados.

---

## Commit

Después de modificar datos debemos confirmar la transacción:

```python
connection.commit()
```

Sin commit, los cambios pueden no guardarse.

---

## Cerrar conexiones

Las conexiones abiertas consumen recursos.

Por eso siempre debemos cerrarlas:

```python
connection.close()
```

---

## Arquitectura después del módulo

```text
app

├── database
│   └── connection.py
│
├── models
│   └── coin.py
│
├── repositories
│   └── coin_repository.py
│
└── main.py
```

---

## Próximo módulo

En el siguiente módulo uniremos todas las piezas:

CoinGecko API

↓

Servicio Python

↓

Modelo Coin

↓

CoinRepository

↓

MySQL

Crearemos el primer flujo completo del sistema Crypto Tracker.
