# Módulo 14 - MySQL desde cero

> ### Objetivos
>
> Al finalizar este módulo:
>
> - Instalarás MySQL.
> - Comprenderás cómo funciona un servidor de base de datos.
> - Crearás tu primera base de datos.
> - Aprenderás SQL básico.
> - Crearás las tablas del proyecto.

## Clase 1 - ¿Qué es MySQL?

Cuando trabajábamos con Python:

```py
coin = Coin(...)
```

El objeto vivía en la memoria RAM.

Con MySQL sucede algo distinto.

Existe un programa que permanece ejecutándose en segundo plano.

Ese programa recibe órdenes como:

```shell
SELECT
INSERT
UPDATE
DELETE
```

y guarda la información en el disco.

```shell
Arquitectura
Python
↓
mysql-connector
↓
Servidor MySQL
↓
Base de Datos
↓
Tablas
```

Python nunca escribe directamente en los archivos de la base de datos.

Siempre habla con el servidor.

## Clase 2 - Instalar MySQL

Si todavía no lo tienes instalado, descarga MySQL Community Server 8.x.

Durante la instalación:

- Configura una contraseña para el usuario root.
- Anótala, porque la necesitaremos más adelante.
- Deja el puerto por defecto (3306).

También recomiendo instalar MySQL Workbench, ya que facilita visualizar la base de datos mientras aprendemos.

## Clase 3 - ¿Qué es SQL?

SQL significa:

Structured Query Language

Es el lenguaje que utilizan las bases de datos relacionales.

```shell
# Con SQL podremos:
# Crear una base de datos.
CREATE DATABASE

# Crear tablas.
CREATE TABLE

# Insertar datos.
INSERT

# Consultar información.
SELECT

# Actualizar registros.
UPDATE

# Eliminar registros.
DELETE
```

## Clase 4 - Crear nuestra base de datos

Abre MySQL Workbench o la consola de MySQL y ejecuta:

```shell
CREATE DATABASE crypto_tracker;
# Ahora verifica que existe:

SHOW DATABASES;
```

Deberías obtener algo similar a:

```
information_schema

mysql

performance_schema

sys

crypto_tracker
```

## Clase 5 - Seleccionar la base de datos

Antes de crear tablas debemos indicar cuál utilizaremos.

```shell
USE crypto_tracker;
```

Todo lo que creemos a partir de ahora pertenecerá a esa base de datos.

## Clase 6 - Crear la tabla users

```shell
CREATE TABLE users (

    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

);
```

Analizando el SQL
INT AUTO_INCREMENT

Cada usuario tendrá un número único.

```shell
# Ejemplo:
| id | ... |
|----|-----|
| 1  | ... |
| 2  | ... |
| 3  | ... |
| 4  | ... |
```

No necesitamos asignarlo manualmente.

`PRIMARY KEY`

Identifica un registro de manera única.

Nunca pueden existir dos usuarios con el mismo id.

`NOT NULL`

Obliga a que la columna tenga un valor.

No podemos crear un usuario sin nombre o sin correo.

`UNIQUE`

email VARCHAR(255) UNIQUE

Impide que dos usuarios compartan el mismo correo electrónico.

`CURRENT_TIMESTAMP`

Asigna automáticamente la fecha y hora de creación del registro.

No necesitamos enviarla desde Python.

## Clase 7 - Crear la tabla coins

```shell
CREATE TABLE coins (

    id VARCHAR(50) PRIMARY KEY,

    symbol VARCHAR(20) NOT NULL,

    name VARCHAR(100) NOT NULL,

    market_cap_rank INT

);
```

¿Por qué VARCHAR(50) como clave primaria?

CoinGecko ya nos entrega un identificador estable.

```shell
#Por ejemplo:
bitcoin
ethereum
solana
```

No necesitamos crear un INT adicional.

## Clase 8 - Crear la tabla price_history

```shell
CREATE TABLE price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coin_id VARCHAR(50) NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coin_id)
    REFERENCES coins(id)

);
```

¿Qué es una clave foránea?

```py
# Observa:
FOREIGN KEY (coin_id)
REFERENCES coins(id)
```

### Eso significa:

El valor de coin_id debe existir previamente en la tabla coins.

No podremos guardar el precio de una moneda inexistente.

## Clase 9 - Crear la tabla favorites

Con clave primaria compuesta:

```shell
CREATE TABLE favorites (

    user_id INT NOT NULL,

    coin_id VARCHAR(50) NOT NULL,

    PRIMARY KEY (user_id, coin_id),

    FOREIGN KEY (user_id)

        REFERENCES users(id),

    FOREIGN KEY (coin_id)

        REFERENCES coins(id)

);
```

### ¿Qué conseguimos?

Supongamos:

```shell
Mateo
↓
Bitcoin
# Si intentamos insertar nuevamente:
Mateo
↓
Bitcoin
```

MySQL responderá con un error.

La combinación ya existe.

Eso mantiene la integridad de los datos.

## Clase 10 - Verificar las tablas

Puedes comprobar que todo se creó correctamente con:

```shell
SHOW TABLES;

# Resultado esperado:

coins
favorites
price_history
users

# Y para inspeccionar una tabla:

DESCRIBE users;

```
