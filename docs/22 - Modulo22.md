# Módulo 22 - Consultas y lectura de datos desde Repository

> ### Objetivo
>
> Agregar métodos de lectura a nuestros repositories:
>
> - find_all()
> - find_by_id()
>
> Aprender:
>
> - Cómo hacer consultas SELECT.
> - Cómo recibir resultados desde MySQL.
> - Cómo transformar filas de MySQL en objetos Python.

### Situación actual

```py
# Actualmente tenemos:
# Python Object
#     |
#     |
#   save()
#     |
#     |
#   INSERT
#     |
#     |
#   MySQL

# EJEMPLO
user_repository.save(user)
#Guarda:

#   User
#     |
#     |
# users table
```

Pero una aplicación real también necesita:

```shell
Usuario abre aplicación
        |
        |
"Mostrar mis monedas favoritas"
        |
        |
SELECT en MySQL
        |
        |
Datos regresan a Python

#Nuevo flujo
# Ahora tendremos:
Model
  ↑
Repository
  ↑
MySQL
```

El repository será responsable de convertir:

SQL → Python

## 1. Mejorar UserRepository

[CODIGO](../backend/app/repositories/user_repository.py)

Ahora agregamos: `find_all()`

**Explicacion**

```py
# Creamos la conección
connection = get_connection()
# Abrimos comunicacion con MySQL

# CREAMOS CURSOR
cursor = connection.cursor(dictionary=True)

# El cursor ejecuta SQL con: dictionary=True

# MySQL devuelve:
# {
# "id":1,
# "username":"mateo"
# }
# en lugar
# (1,"mateo")

# EJECUTAMOS SQL
cursor.execute(query)

# Ejecuta:
# SELECT *
# FROM users;

# Obtiene resultados
users = cursor.fetchall()

# Ejemplo:

# [
#  {
#   "id":1,
#   "username":"mateo"
#  }
# ]
```

## 2. Crear find_by_id()

Ahora agregamos una búsqueda especifica.

**EJEMPLO**: buscar usuario con id 1

### Diferencia entre fetchall y fetchone

```py
fetchall()

# Devuelve muchos registros:
# [{}, {}, {}]
# Ejemplo:

SELECT * FROM users;

fetchone()
# Devuelve uno:
# {
# "id":1,
# "username":"mateo"
# }

# Ejemplo:

SELECT *
FROM users
WHERE id = 1;
```

## Concepto importante del módulo

Hasta ahora: `Repository`

```
solo hacía: Guardar datos
Ahora hace:
Guardar datos
      |
Consultar datos
```

### ¿Por qué esto no lo hacemos en el Service?

Porque cada capa tiene una responsabilidad.

```py
Incorrecto:

class UserService:

    SELECT * FROM users
```

El Service no debería saber SQL.

Correcto:

```shell
   UserService
       |
       |
  UserRepository
       |
       |
     MySQL
```
