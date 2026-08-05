# Módulo 15 - Conectar Python🐍 con MySQL🐬

> ### Objetivos
>
> - Conectar Python con MySQL.
> - Qué es un driver.
> - Instalar `mysql-connector-python`.
> - Crear una configuración de base de datos (DB).
> - Separar responsabilidades.
> - Probar una conexión.
> - Entender el patrón Repository que usaremos más adelante.

---

## Clase 1 - ¿Cómo se comunica Python con MySQL?

Python no entiende directamente el protocolo de MySQL.

Necesitamo una libreria intermediaria.

Esa libreria se llama: `mysql-connector-python`

El flujo será:

```shell
Python
  ↓
mysql-connector-python
  ↓
MySQL Server
  ↓
crypto_tracker
```

---

## Clase 2 - Instalar el driver

1. Vericar que estamos dentro del entorno virtual.
   Dentro de powershell ver algo asi
   ```shell
   (.venv) ...\crypto_tracker\backend>
   ```
2. Instalar
   ```shell
   pip install mysql-connector-python
   ```
3. Actualizamos `requirements.txt`
   ```shell
    pip freeze > requirements.txt
   ```

## Clase 3 - Nueva estructura del proyecto

Actualmente tenemos algo parecido a:

```shell
backend

│
├── app
│   │
│   ├── main.py
│   │
│   ├── services
│   │
│   ├── utils
│
├── tests
│
├── .env
│
└── requirements.txt
```

Ahora agregaremos:

```shell
app
├── database
│   │
│   ├── __init__.py
│   └── connection.py
│
├── config
│
├── services
│
├── models
│
└── main.py
```

---

### ¿Por qué una carpeta `database`?

Porque toda la lógica relacionada con almacenamiento debe estar separada.

Ejemplo incorrecto:

```py
# main.py
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234"
)
```

Hay muchos problemas en ese ejemplo

- Mezclamos lógica de aplicación con infraestructura.
- Si cambiamos My SQL pot Postgress tendremos que modificar muchos archivos.
- Las credenciales quedan expuestas.

Forma correcta:

```shell
main.py
  ↓
database/connection.py
  ↓
MySQL
```

## Clase 4 - Configuración de la conexión

Vamos a utilizar nuestro `.env`

Actualmente solo tenemos

```env
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
REQUEST_TIMEOUT=10
```

Agregaremos:

```env
MYSQL_HOST=localhost
MYSQL_PORT={port}
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=nombre_DB
```

### ¿Por qué no escribir esto directamente?

```py
# Ejemplo malo:
password="MiPassword123"
```

Problemas:

- Se sube accidentalmente a Git.
- Todos los desarrolladores verían la contraseña.
- Cambiar configuraciones requiere modificar código.

## Clase 5 - Crear la conexión

Archivo: [Ir al archivo](../backend/app/database/connection.py)

Código:

import mysql.connector

from app.config.settings import settings


def get_connection():

    connection = mysql.connector.connect(
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        database=settings.mysql_database
    )

    return connection
Analizando el código
Importamos mysql
import mysql.connector

Es la librería que instalamos.

Nos permite crear conexiones.

Importamos settings
from app.config.settings import settings

No queremos leer .env aquí directamente.

La configuración ya debe estar centralizada.

Función get_connection
def get_connection():

Cada vez que necesitemos hablar con MySQL llamaremos:

connection = get_connection()
mysql.connector.connect()

Aquí ocurre la conexión real:

mysql.connector.connect(...)

Python intenta conectarse al servidor:

localhost:3306

con las credenciales configuradas.

Clase 6 - Crear prueba de conexión

Creamos:

app/tests/database_test.py

Código:

from app.database.connection import get_connection


def main():

    connection = None

    try:

        connection = get_connection()

        print("Conexión exitosa con MySQL")

    except Exception as error:

        print("Error:", error)

    finally:

        if connection:
            connection.close()


if __name__ == "__main__":
    main()
¿Qué estamos haciendo?

Intentamos:

connection = get_connection()

Si funciona:

Conexión exitosa con MySQL

Si falla:

Error: Access denied...

o:

Can't connect to MySQL server
Clase 7 - Ejecutar prueba

Desde:

backend

ejecutamos:

python -m app.tests.database_test

Resultado esperado:

Conexión exitosa con MySQL
Concepto importante: cerrar conexiones

Una conexión abierta consume recursos.

Mala práctica:

connection = get_connection()

# usar conexión

# nunca cerrar

Con el tiempo:

conexiones abiertas.
memoria ocupada.
errores del servidor.

Por eso usamos:

finally:
    connection.close()


    