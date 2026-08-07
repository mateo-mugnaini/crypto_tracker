# Módulo 22 - Consultas SELECT y lectura de datos

## Objetivo

En este módulo aprendemos a recuperar información desde MySQL utilizando repositories.

Hasta este momento los repositories solamente podían guardar datos.

Ahora también pueden consultar información.

---

# Operaciones de lectura

Las consultas SQL utilizan:

```sql
SELECT
```

Ejemplo:

```sql
SELECT *
FROM users;
```

Esto devuelve registros almacenados en la base de datos.

---

# find_all()

El método:

```python
find_all()
```

obtiene todos los registros de una tabla.

Ejemplo:

```python
users = repository.find_all()
```

Internamente ejecuta:

```sql
SELECT *
FROM users;
```

---

# find_by_id()

Este método busca un único registro.

Ejemplo:

```python
repository.find_by_id(1)
```

Internamente:

```sql
SELECT *
FROM users
WHERE id = 1;
```

---

# fetchall()

`fetchall()` devuelve múltiples registros.

Ejemplo:

```python
[
 {},
 {},
 {}
]
```

Se utiliza cuando esperamos varios resultados.

---

# fetchone()

`fetchone()` devuelve solamente un registro.

Ejemplo:

```python
{
"id":1,
"username":"mateo"
}
```

Se utiliza cuando buscamos un elemento específico.

---

# dictionary=True

MySQL Connector puede devolver datos como tuplas.

Ejemplo:

```python
(1,"mateo")
```

Con:

```python
dictionary=True
```

obtenemos:

```python
{
"id":1,
"username":"mateo"
}
```

Esto facilita trabajar con los datos.

---

# Arquitectura actual

```text
Service

↓

Repository

↓

Database
```

El Repository es responsable de traducir entre objetos Python y consultas SQL.

---

# Resultado del módulo

Crypto Tracker ahora puede:

- guardar usuarios;
- consultar usuarios;
- buscar usuarios específicos.

El siguiente paso será implementar la misma lógica de lectura para monedas, favoritos e historial de precios.
