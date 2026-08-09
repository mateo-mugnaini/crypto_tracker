# Módulo 30 - Integración entre favoritos y monedas

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

Integrar las tablas `favorites` y `coins` mediante un `INNER JOIN`.

Hasta este módulo, podíamos consultar los favoritos de un usuario, pero solamente obteníamos:

```text
user_id
coin_id
```

En este módulo aprendimos a recuperar también la información de la moneda.

---

## Estructura de las tablas

### `favorites`

```text
user_id
coin_id
```

La tabla representa la relación entre un usuario y una moneda favorita.

### `coins`

```text
id
symbol
name
market_cap_rank
```

La tabla contiene la información de las monedas.

La relación entre ambas tablas es:

```text
favorites.coin_id
       ↓
   coins.id
```

---

## INNER JOIN

La consulta utilizada es:

```sql
SELECT
    f.user_id,
    f.coin_id,
    c.symbol,
    c.name,
    c.market_cap_rank
FROM favorites f
INNER JOIN coins c
    ON f.coin_id = c.id
WHERE f.user_id = %s
```

Esto permite obtener los favoritos de un usuario junto con la información correspondiente de cada moneda.

---

## FavoriteRepository

Se agregó:

```python
def find_all_with_coin_data(self, user_id):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT
        f.user_id,
        f.coin_id,
        c.symbol,
        c.name,
        c.market_cap_rank
    FROM favorites f
    INNER JOIN coins c
        ON f.coin_id = c.id
    WHERE f.user_id = %s
    """

    cursor.execute(query, (user_id,))

    favorites = cursor.fetchall()

    cursor.close()
    connection.close()

    return favorites
```

---

## FavoriteService

Se agregó:

```python
def get_favorites_with_coin_data(self, user_id):

    return self.repository.find_all_with_coin_data(user_id)
```

El Service no conoce el SQL.

Su responsabilidad es utilizar el Repository.

---

## Test

Se creó:

```text
app/tests/favorite_with_coin_test.py
```

Código:

```python
from app.repositories.favorite_repository import FavoriteRepository
from app.services.favorite_service import FavoriteService


def main():

    repository = FavoriteRepository()

    service = FavoriteService(repository)

    favorites = service.get_favorites_with_coin_data(1)

    if not favorites:
        print("El usuario no tiene favoritos.")
        return

    print("Favoritos del usuario:")
    print()

    for favorite in favorites:

        print(f"ID: {favorite['coin_id']}")
        print(f"Nombre: {favorite['name']}")
        print(f"Símbolo: {favorite['symbol']}")
        print(f"Market Cap Rank: {favorite['market_cap_rank']}")
        print("------------------------")


if __name__ == "__main__":
    main()
```

Se ejecuta con:

```powershell
python -m app.tests.favorite_with_coin_test
```

---

## Resultado esperado

Si el usuario tiene:

```text
bitcoin
ethereum
```

el resultado será similar a:

```text
Favoritos del usuario:

ID: bitcoin
Nombre: Bitcoin
Símbolo: btc
Market Cap Rank: 1
------------------------
ID: ethereum
Nombre: Ethereum
Símbolo: eth
Market Cap Rank: 2
------------------------
```

---

## `dictionary=True`

El Repository utiliza:

```python
cursor = connection.cursor(dictionary=True)
```

Por eso cada registro se obtiene como un diccionario:

```python
{
    "user_id": 1,
    "coin_id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "market_cap_rank": 1
}
```

Esto permite acceder a los campos mediante:

```python
favorite["coin_id"]
favorite["name"]
favorite["symbol"]
```

---

## Arquitectura

El flujo actual es:

```text
Test
  ↓
FavoriteService
  ↓
FavoriteRepository
  ↓
MySQL
  ↓
favorites + coins
```

El Repository es responsable de realizar el `JOIN`.

El Service utiliza el resultado.

El Test comprueba el comportamiento.

---

## Conceptos aprendidos

### INNER JOIN

Permite combinar información de dos tablas relacionadas.

### Alias de tablas

Utilizamos:

```sql
favorites f
coins c
```

Por lo que podemos escribir:

```sql
f.coin_id
c.name
c.symbol
```

en lugar de escribir los nombres completos.

### Relaciones entre tablas

El modelo actual es:

```text
users
  │
  │ user_id
  ▼
favorites
  │
  │ coin_id
  ▼
coins
```

Esto permite construir consultas más completas sin duplicar información en la base de datos.

---

## Nota

En este módulo no modificamos los modelos `Favorite` ni `Coin`.

El resultado del `JOIN` se mantiene como diccionario porque estamos trabajando directamente con el resultado de la consulta SQL.

La conversión a objetos de dominio se puede incorporar posteriormente cuando sea necesario.
