# Módulo 25 - Sincronización inteligente y actualización de registros

Objetivo

Hasta ahora nuestro flujo es:

CoinGecko API
│
▼
CoinService
│
▼
CoinRepository.save()
│
▼
MySQL

La primera vez funciona perfectamente.

La segunda vez...

Duplicate entry 'bitcoin' for key 'PRIMARY'

¿Por qué?

Porque la moneda ya existe en la base de datos.

¿Cuál es el problema?

Supongamos que hoy CoinGecko devuelve:

id rank
bitcoin 1
ethereum 2

Los guardamos.

Al día siguiente ejecutamos nuevamente la sincronización.

La API devuelve:

id rank
bitcoin 1
ethereum 2

Nuestro código intenta hacer otra vez:

INSERT INTO coins (...)

Pero bitcoin ya existe.

MySQL responde:

Duplicate entry
¿Qué opciones tenemos?
Opción 1

Eliminar toda la tabla.

DELETE FROM coins;

❌ Mala práctica.

Perdemos todos los datos.

Opción 2

Ignorar el error.

try:
repository.save(coin)
except:
pass

❌ Muy mala práctica.

Oculta errores reales.

Opción 3

Preguntar primero si la moneda existe.

Si existe:

UPDATE

Si no existe:

INSERT

✅ Esta será la estrategia que implementaremos.

Agregar un método exists()

En CoinRepository:

def exists(self, coin_id):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
    SELECT COUNT(*)
    FROM coins
    WHERE id = %s
    """

    cursor.execute(query, (coin_id))

    count = cursor.fetchone()[0]

    cursor.close()
    connection.close()

    return count > 0

¿Qué devuelve?

Si existe:

True

Si no existe:

False
Agregar update()

También en CoinRepository:

def update(self, coin):

    connection = get_connection()

    cursor = connection.cursor()

    query = """
    UPDATE coins
    SET
        symbol = %s,
        name = %s,
        market_cap_rank = %s
    WHERE id = %s
    """

    cursor.execute(
        query,
        (
            coin.symbol,
            coin.name,
            coin.market_cap_rank,
            coin.id
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

Ahora modificamos el Service

Antes teníamos:

coin = CoinMapper.to_coin(data)

self.repository.save(coin)

Ahora:

coin = CoinMapper.to_coin(data)

if self.repository.exists(coin.id):
self.repository.update(coin)
else:
self.repository.save(coin)

return coin

Fíjate que la decisión de negocio está en el Service.

El Repository no decide.

Solo ejecuta la operación solicitada.

¿Por qué no poner esa lógica en el Repository?

Porque el Repository solo debería saber hacer:

Guardar

Actualizar

Buscar

Eliminar

No debería decidir cuándo usar cada operación.

Esa decisión pertenece al Service.

Flujo completo
CoinGecko API
│
▼
CoinService
│
▼
¿Existe?
│
┌───┴────┐
│ │
Sí No
│ │
▼ ▼
UPDATE INSERT
│ │
└────┬─────┘
▼
MySQL
