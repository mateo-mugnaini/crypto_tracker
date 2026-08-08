Módulo 27 — Servicio de Favoritos

Hasta ahora tenemos:

✅ CoinService
✅ PriceHistoryService

El siguiente paso lógico es permitir que un usuario pueda guardar sus criptomonedas favoritas.

Objetivo

Crear un servicio que gestione la relación entre usuarios y monedas favoritas.

Recordemos el modelo de la base de datos:

## users

id
username
email
password

        1
        │
        │
        ▼

## favorites

id
user_id
coin_id

        ▲
        │
        │

## coins

id
symbol
name
market_cap_rank

Un usuario puede tener muchas monedas favoritas y una moneda puede pertenecer a muchos usuarios.

¿Qué hará FavoriteService?

Inicialmente tendrá tres responsabilidades:

Agregar una moneda a favoritos.
Eliminar una moneda de favoritos.
Obtener todas las favoritas de un usuario.

No accederá directamente a MySQL, sino que utilizará el FavoriteRepository.

Crear el servicio

app/services/favorite_service.py

class FavoriteService:

    def __init__(self, repository):
        self.repository = repository

    def add_favorite(self, favorite):
        self.repository.save(favorite)

    def remove_favorite(self, user_id, coin_id):
        self.repository.delete(user_id, coin_id)

    def get_favorites(self, user_id):
        return self.repository.find_by_user(user_id)

Observa que, igual que en los demás servicios, no hay SQL.

Toda la persistencia queda delegada al Repository.

¿Por qué crear un Service si solo llama al Repository?

Ahora parece innecesario:

def add_favorite(self, favorite):
self.repository.save(favorite)

Pero esto cambia cuando aparecen reglas de negocio.

Por ejemplo:

No permitir favoritos duplicados.
Limitar a 100 favoritos por usuario.
Verificar que la moneda exista.
Registrar eventos o auditorías.

Si el código llamara directamente al Repository desde todos lados, habría que repetir esa lógica.

El Service actúa como la puerta de entrada para las reglas de negocio.
