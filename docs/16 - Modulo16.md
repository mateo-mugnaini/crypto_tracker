# Módulo 16 - Repository Pattern y persistencia de datos

> ### Objetivos
>
> - Entender que es un `Repository`.
> - Por qué no debemos hacer SQL directamente desde `main.py`.
> - Cómo separar lógica de negocio y acceso a datos.
> - Crear el primer CoinRepository.
> - Insertar monedas en MySQL desde Python.
> - Consultar datos almacenados.

## Clase 1 - El problema que queremos evitar

Esto esta `⛔MAL⛔`. No hacer esto en `main.py`

```py
import mysql.connector


connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="crypto_tracker"
)


cursor = connection.cursor()

cursor.execute(
    "SELECT * FROM coins"
)

coins = cursor.fetchall()

print(coins)
```

FUNCIONA? Si...

PERO... hay un problema.

main.py ahora sabe demasiado.

- Sabe conectarse a MySQL.
- Sabe SQL.
- Sabe tablas.
- Sabe cómo obtener datos.
- SAbe mostrar info.

En proyectos puede ser funcional y correcto. Pero no es una buena practica y en proyectos grandes se hace dificil de mantener.

## Clase 2 - ¿Qué es un Repository?

Es una capa encargada exclusivamente de comunicarse con la base de datos (DB)

Su responsabilidad:

- Crear consultas SQL.
- Enviar datos a MySQL.
- Devolver resultados.

Lo que no debe hacer:

- Imprimir info.
- Llamar APIs externas.
- Tomar decisiones de negocio.

Nuestro flujo será:

```shell
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

## Clase 3 - Nueva estructura

Vamos a agregar

```shell
├── database
│   └── connection.py
│
├── repositories
│   ├── __init__.py
│   └── coin_repository.py
```

### ¿POR QUÉ UNA CARPETA REPOSITORIES?

Porque tendremos diferentes tablas en un futuro.

```shell
│
├── repositories
│   ├── __init__.py
│   ├── coin_repository.py
│   ├── user_repository.py
│   ├── favorite_repository.py
│   └── price_repository.py
```

Cada uno conoce su propia tabla.

## Clase 4 - Modelo de datos

Antes de crear consultar SQL vamos a crear un modelo.

**¿Por qué?**: Porque no queremos trabajar con diccionarios giganes.

Refactorizamos [COIN.PY](../backend/app/models/coin.py)

¿Qué es `dataclass`?

`@dataclass` es una herramienta de Python para crear clases que representas datos.

Sin dataclass tendríamos:

```py
class Coin:

    def __init__(
        self,
        id,
        symbol,
        name
    ):
        self.id = id
        self.symbol = symbol
        self.name = name

```

con @dataclass:

Python genera automáticamente:

- Constructor.
- Representación del objeto.
- Comparación

## Clase 5 - Crear un Repository: `coin_repository.py`

Archivo: [VER CODIGO](../backend/app/repositories/coin_repository.py)

ANALISIS:

```py
# Método save()
def save(self, coin: Coin):

#Recibimos un objeto.
    Coin(
        id="bitcoin"
        symbol="btc"
        name="Bitcoin"
    )

# Crea la conexión
    connection = get_connection()

# Usa nuestro módulo anteiror.
# No sabe cómo conectarse.
# Solo pide una conexión.

# CURSOR:
    cursor = connection.cursor()

# El cursor ejecuta comandos SQL.
# Es como un intermediario
# Python
# ↓
# Cursor
# ↓
# MySQL

# INTER INTO
# Es nuestra consulta:
        INSERT INTO coins
# guarda una moneda
```

### ¿Qué significa `%s`?

```py
#EJEMPLO
query = """
INSERT INTO coins VALUES (%s)
"""
# NO HACEMOS:
f"INSERT bitcoin"
# Porque es inseguro

# Se usan parámetros

    cursor.execute(
        query,
        valores
    )
# Eso evita SQL Injection.
```
### ON DUPLICATE KEY UPDATE

Esta parte es importante.
```py
# Tenemos 
id VARCHAR PRIMARY KEY

# Si intentamos guardar:
# ej: bitcoin
# dos vences
# MySQL detecta que ya existe.

# Entonces actualiza: 
# - symbol
# - name
# - market_cap_rank
```

## Clase 6 - Crear prueba

Creamos [repository_test.py]()