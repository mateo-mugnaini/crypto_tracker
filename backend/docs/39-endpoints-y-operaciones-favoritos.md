# Módulo 39 - Endpoints de favoritos y operaciones HTTP

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

Integrar las operaciones de favoritos con la API HTTP mediante FastAPI.

En este módulo se conectan los Controllers de favoritos con los endpoints HTTP, permitiendo:

- Agregar favoritos.
- Consultar favoritos.
- Consultar favoritos con información de la moneda.
- Eliminar favoritos.
- Recibir parámetros mediante path y query parameters.
- Probar las operaciones desde Swagger/OpenAPI.

---

## 1. Arquitectura

El flujo utilizado en este módulo es:

```text
HTTP Request
     ↓
FastAPI
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
MySQL
```

Por ejemplo, para eliminar un favorito:

DELETE /favorites/{coin_id}?user_id=1
↓
FavoriteController
↓
FavoriteService
↓
FavoriteRepository
↓
MySQL

Cada capa mantiene una responsabilidad específica.

2. FavoriteController

El Controller actúa como intermediario entre FastAPI y FavoriteService.

Su responsabilidad es:

Recibir los parámetros.
Ejecutar el método correspondiente del Service.
Transformar el resultado en una respuesta apropiada.
No ejecutar SQL.
No contener lógica de negocio.

Ejemplo conceptual:

class FavoriteController:

    def __init__(self, service):
        self.service = service

3. Agregar favorito

Endpoint:

POST /favorites

El endpoint recibe los datos necesarios para crear un favorito.

El flujo es:

Request
↓
FavoriteController
↓
FavoriteService.add_favorite()
↓
Validar usuario
↓
Validar moneda
↓
Comprobar duplicado
↓
FavoriteRepository.save()
↓
MySQL

El FavoriteService es responsable de las validaciones.

Por ejemplo:

success, message = service.add_favorite(favorite)

El resultado se transforma posteriormente en una respuesta HTTP.

4. Consultar favoritos

Endpoint:

GET /favorites

El usuario se identifica mediante un parámetro:

user_id

Ejemplo conceptual:

GET /favorites?user_id=1

El flujo es:

GET /favorites
↓
FavoriteController
↓
FavoriteService.get_favorites()
↓
FavoriteRepository.find_all_by_user()
↓
MySQL

El Service primero verifica que el usuario exista.

Si existe:

success = True
data = lista de favoritos

Si no existe:

success = False
message = "El usuario no existe." 5. Consultar favoritos con información de las monedas

También se dispone de una operación para obtener los favoritos junto con información de las monedas.

El Repository utiliza un INNER JOIN:

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

Esto permite obtener información como:

bitcoin
BTC
Bitcoin
ranking: 1

en lugar de solamente:

bitcoin

El flujo continúa siendo:

FastAPI
↓
FavoriteController
↓
FavoriteService
↓
FavoriteRepository
↓
MySQL 6. Eliminar favorito

Endpoint:

DELETE /favorites/{coin_id}

El usuario se recibe mediante query parameter:

user_id

Ejemplo:

DELETE /favorites/bitcoin?user_id=1

Aquí utilizamos dos tipos de parámetros HTTP:

Path parameter
{coin_id}

Representa la moneda que queremos eliminar.

Query parameter
?user_id=1

Representa el usuario propietario del favorito.

7. Flujo de eliminación

El flujo completo es:

DELETE /favorites/bitcoin?user_id=1
↓
FavoriteController
↓
FavoriteService
↓
Verificar favorito
↓
FavoriteRepository.delete()
↓
MySQL

El Repository utiliza:

DELETE FROM favorites
WHERE user_id = %s
AND coin_id = %s

Después verifica:

deleted = cursor.rowcount > 0

Esto permite saber si realmente se eliminó un registro.

8. Resultado de la eliminación

Si el favorito existe:

{
"success": true,
"message": "Favorito eliminado correctamente."
}

Si no existe:

{
"success": false,
"message": "La moneda no está en favoritos."
}

Esto permite que el Controller comunique el resultado de la operación al cliente.

9. FastAPI y Swagger

Los endpoints pueden probarse mediante la interfaz automática de FastAPI:

http://127.0.0.1:8000/docs

Swagger permite:

Ver los endpoints disponibles.
Ver parámetros.
Ejecutar peticiones.
Ver respuestas.
Detectar errores de validación.

Para levantar la aplicación:

uvicorn app.api.app:app --reload 10. Path Parameters

FastAPI permite declarar parámetros directamente en la ruta.

Ejemplo:

@app.delete("/favorites/{coin_id}")
def delete_favorite(coin_id: str, user_id: int):
...

En:

/favorites/bitcoin

FastAPI interpreta:

coin_id = "bitcoin" 11. Query Parameters

Los parámetros que no forman parte de la ruta pueden recibirse como query parameters.

Ejemplo:

/favorites/bitcoin?user_id=1

FastAPI obtiene:

coin_id = "bitcoin"
user_id = 1

Esto permite diferenciar claramente:

/favorites/{coin_id}

de:

?user_id=1 12. Validación automática

FastAPI realiza validaciones básicas automáticamente.

Por ejemplo:

user_id: int

indica que user_id debe ser un entero.

Una petición como:

?user_id=abc

puede generar una respuesta:

422 Unprocessable Entity

Esto evita tener que implementar manualmente ciertas validaciones de tipos.

13. Error encontrado durante el módulo

Durante las pruebas apareció inicialmente una URL incorrecta:

http://127.0.0.1:8000favorites/{coin_id}?user_id=1

El problema era la ausencia de / después del puerto:

8000favorites

La ruta correcta es:

http://127.0.0.1:8000/favorites/{coin_id}?user_id=1

Además, al realizar la petición real desde Swagger, {coin_id} debe sustituirse por una moneda concreta, por ejemplo:

http://127.0.0.1:8000/favorites/bitcoin?user_id=1 14. Pruebas realizadas

Durante el módulo se verificaron las operaciones HTTP desde FastAPI/Swagger.

Las peticiones fueron probadas correctamente después de corregir la URL.

Estado:

Operación Estado
Agregar favorito OK
Obtener favoritos OK
Obtener favoritos con datos de moneda OK
Eliminar favorito OK
Path parameters OK
Query parameters OK
Swagger/OpenAPI OK 15. Conceptos aprendidos

En este módulo se trabajó con:

FastAPI.
Endpoints HTTP.
GET.
POST.
DELETE.
Path parameters.
Query parameters.
Controllers.
Services.
Repositories.
Respuestas JSON.
Validación automática de FastAPI.
Swagger/OpenAPI.
Integración con MySQL.
Flujo completo Request → Controller → Service → Repository → Database. 16. Estado del proyecto

Después del módulo 39:

CoinGecko API
↓
API Client
↓
Services
↓
Repositories
↓
MySQL
↑
Controllers
↑
FastAPI
↑
HTTP Requests

El proyecto ya cuenta con una API HTTP funcional capaz de interactuar con las principales funcionalidades implementadas del backend.
