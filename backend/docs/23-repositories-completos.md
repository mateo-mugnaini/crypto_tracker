# Módulo 23 - Repositories completos

## Objetivo

En este módulo completamos la capa Repository para todas las entidades del proyecto.

Los repositories permiten separar la lógica de acceso a datos del resto de la aplicación.

---

# CoinRepository

Responsable de manejar información de monedas.

Métodos:

```python
save()

find_all()

find_by_id()
```

Permite guardar monedas y recuperarlas desde MySQL.

---

# FavoriteRepository

Gestiona la relación entre usuarios y monedas favoritas.

La tabla contiene:

```text
user_id

coin_id
```

Un usuario puede tener múltiples monedas favoritas.

Métodos:

```python
save()

find_all_by_user()
```

---

# PriceHistoryRepository

Gestiona el historial de precios.

La información almacenada:

```text
coin_id

price

recorded_at
```

Métodos:

```python
save()

find_by_coin()
```

---

# Consultas SELECT

Los repositories utilizan consultas SQL:

```sql
SELECT *
FROM tabla;
```

para recuperar información.

---

# fetchall()

Se utiliza cuando esperamos múltiples registros.

Ejemplo:

```python
coins = repository.find_all()
```

Devuelve una lista.

---

# fetchone()

Se utiliza cuando esperamos un único registro.

Ejemplo:

```python
coin = repository.find_by_id("bitcoin")
```

---

# ORDER BY

El historial de precios utiliza:

```sql
ORDER BY recorded_at DESC
```

para mostrar los registros más recientes primero.

---

# Arquitectura actual

```text
Service

↓

Repository

↓

Database

↓

MySQL
```

La aplicación tiene una separación clara entre lógica de negocio y persistencia de datos.
