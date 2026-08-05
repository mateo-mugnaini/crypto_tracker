# Módulo 14 - MySQL desde cero

## ¿Qué es MySQL?

MySQL es un sistema gestor de bases de datos relacional (RDBMS).

Permite almacenar información de forma persistente y consultarla mediante el lenguaje SQL.

A diferencia de las variables de un programa, los datos permanecen almacenados incluso después de cerrar la aplicación.

---

## Arquitectura

El flujo de comunicación será:

Python

↓

Driver de MySQL

↓

Servidor MySQL

↓

Base de datos

↓

Tablas

Python nunca modifica directamente los archivos de la base de datos; todas las operaciones pasan por el servidor MySQL.

---

## ¿Qué es SQL?

SQL (Structured Query Language) es el lenguaje utilizado para comunicarse con bases de datos relacionales.

Las operaciones más comunes son:

- `CREATE DATABASE`
- `CREATE TABLE`
- `INSERT`
- `SELECT`
- `UPDATE`
- `DELETE`

---

## Creación de la base de datos

Creamos la base de datos con:

```sql
CREATE DATABASE crypto_tracker;
```

Luego la seleccionamos:

```sql
USE crypto_tracker;
```

A partir de ese momento todas las tablas se crearán dentro de esa base de datos.

---

## Tabla `users`

Almacena la información de los usuarios registrados.

Características importantes:

- `id` es autoincremental.
- `email` debe ser único.
- `created_at` se genera automáticamente con la fecha y hora actuales.

---

## Tabla `coins`

Almacena información básica de las criptomonedas.

Se utiliza el identificador proporcionado por CoinGecko (`bitcoin`, `ethereum`, etc.) como clave primaria, evitando crear un identificador artificial.

---

## Tabla `price_history`

Guarda el historial de precios de cada criptomoneda.

Cada registro contiene:

- La criptomoneda.
- El precio registrado.
- La fecha y hora del registro.

Esto permite conservar la evolución del precio a lo largo del tiempo.

---

## Tabla `favorites`

Relaciona usuarios con criptomonedas favoritas.

Se utiliza una clave primaria compuesta formada por:

- `user_id`
- `coin_id`

Esto impide que un mismo usuario marque dos veces la misma criptomoneda como favorita.

---

## Claves primarias

Una clave primaria identifica de forma única cada registro de una tabla.

Puede estar formada por:

- Una sola columna (clave simple).
- Varias columnas (clave compuesta).

En este proyecto utilizamos ambos tipos.

---

## Claves foráneas

Las claves foráneas establecen relaciones entre tablas.

Permiten mantener la integridad referencial, evitando registros que apunten a datos inexistentes.

Ejemplo:

`price_history.coin_id`

debe existir previamente en:

`coins.id`

---

## Restricciones

Durante el diseño utilizamos varias restricciones:

- `PRIMARY KEY`
- `FOREIGN KEY`
- `NOT NULL`
- `UNIQUE`

Estas restricciones ayudan a mantener la calidad y consistencia de los datos almacenados.

---

## Resumen

Después de este módulo ya disponemos de una base de datos diseñada e implementada.

En el siguiente módulo conectaremos Python con MySQL para comenzar a guardar y consultar información desde nuestra aplicación.
