# Módulo 15 - Conectar Python con MySQL

## ¿Por qué necesitamos un driver?

Python no puede comunicarse directamente con MySQL.

Necesitamos una librería intermediaria llamada driver.

En este proyecto utilizamos:

`mysql-connector-python`

El flujo de comunicación es:

Python

↓

mysql-connector-python

↓

MySQL Server

↓

Base de datos crypto_tracker

---

## Instalación del driver

Instalamos la dependencia mediante:

```bash
pip install mysql-connector-python
```

Después actualizamos el archivo:

```bash
pip freeze > requirements.txt
```

Esto permite que otros desarrolladores puedan instalar exactamente las mismas dependencias.

---

## Separación de responsabilidades

La conexión a la base de datos no debe estar dentro de `main.py`.

Una arquitectura correcta separa:

- lógica de aplicación;
- configuración;
- acceso a datos;
- servicios externos.

Por eso creamos:

```text
database/
    connection.py
```

Este módulo será responsable únicamente de crear conexiones con MySQL.

---

## Variables de entorno

Las credenciales de MySQL se almacenan en `.env`.

Ejemplo:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=crypto_tracker
```

Nunca debemos escribir contraseñas directamente dentro del código.

---

## Función get_connection()

La función:

```python
get_connection()
```

centraliza la creación de conexiones.

De esta manera, si en el futuro cambiamos la configuración o incluso la base de datos, solo tendremos que modificar un único lugar.

---

## Manejo de conexiones

Las conexiones abiertas consumen recursos.

Por eso siempre debemos cerrarlas después de utilizarlas:

```python
connection.close()
```

El bloque `finally` garantiza que la conexión se cierre incluso si ocurre un error.

---

## Pruebas de conexión

Antes de crear repositorios o consultas debemos comprobar que Python puede comunicarse correctamente con MySQL.

Una conexión exitosa indica que:

- MySQL está ejecutándose.
- Las credenciales son correctas.
- La base de datos existe.
- Python tiene instalado el driver necesario.

---

## Arquitectura después del módulo

El proyecto queda:

```text
main.py

↓

services

↓

database/connection.py

↓

MySQL
```

Esta separación permite que el proyecto crezca manteniendo el código organizado.

---

## Próximo módulo

En el siguiente módulo crearemos el primer Repository.

El Repository será responsable de realizar operaciones sobre tablas específicas, por ejemplo:

- guardar monedas;
- buscar monedas;
- actualizar información.

Será la primera capa real de acceso a datos.
