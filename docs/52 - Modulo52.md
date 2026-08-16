# Modulo 52 - Excepciones propias y HTTPExceptions

### ValueError

Es una excepcion generica de Python.

Puede ser util para errores internos o validaciones genericas, pero no describe el domino de nuestra app.

```py
class CoinNotFoundException(ApiException):
    pass
# y entonces:
raise CoinNotFoundException(
    "La moneda no existe."
)
```

Ahora el programa sabe exactamente porque que tipo de error ocurrio.

### HTTPException

Esta es una excepcion de FastAPI.

```py
raise HTTPException(
    status_code=404,
    detail="La moneda no existe."
)
```

Aqui aparece una decision arquitectonica importante:

> ¿Queremos que nuestro Services conozcan HTTPException?

En principio **NO**.

Queremos:

- Que el `SERVICE` conozca el dominio: `CoinNotFoundException`
- La capa HTTP se encargue de convertirlo en `HTTP 404`

---

## ¿Qué es una excepcion de dominio y porque no debemos usar HTTPException dentro del Service?

### 1. ¿Qué es una exception?

Es una forma de indicar que algo salio mal y no podemos continuar con el proceso.

```py
# ejemplo
price = -50

if price < 0:
    raise ValueError("El precio no puede ser negativo.")
```

Cuando Python ejecuta riase, interrumpe el flujo normal y vusca un except que pueda manejar esa excepcion.

```py
try:
    save_price(-50)

except ValueError as error:
    price(error)
```

Por el momento no hay nada especifico de FastAPI. Es solo Python

### 2. ¿Qué es entonces una excepcion de dominio?

Llevandolo a Cripto Tracker

```py
# tenemos:

favorite_service.add_favorite(favorite)

# el servicio comprueba:
if not self.user_repository.exists(favorite.user_id):

# Actualmente haces:

    return False, "El usuario no existe."
```

El problema es que estamos comunicando un error mediante un `tuple`: (False, "El usuario no existe.")

Pero ese False no dice que ocurrio.

Podria significar:

- False → usuario inexistente.
- False → moneda inexistente.
- False → favorito duplicado.
- False → error de base de datos.
- False → cualquier otra cosa.

El programa tiene que mirar el texto para descubrirlo. `ESTO QUEREMOS MEJORAR`

### 3. Crear una excepcion que represente el problema

Podemos decir:

```py
class UserNotFoundException(Exception):
    pass
```

Ahora podemos hacer:

```py
if not self.user_repository.exists(favorite.user_id):
    raise UserNotFoundException("El usuario no existe.")
```

Esto es mucho más expresivo.

Estamos diciendo:

> "No estoy devolviendo un resultado falso. Estoy informando de que ocurrió específicamente un problema de dominio: el usuario no existe."

Y eso es una excepción de dominio.

### 4. ¿Por qué "de dominio"?

Porque describe un problema relacionado con las reglas de nuestra aplicacion.

```text
En nuestro caso:
Crypto Tracker
    │
    ├── UserNotFoundException
    ├── CoinNotFoundException
    ├── FavoriteAlreadyExistsException
    └── ...
```

Estas excepciones hablan el lenguaje de nuestro sistema.

- ⛔ No hablan de HTTP.
- ⛔ No hablan de FastAPI.
- ⛔ No hablan de JSON.
- ⛔ No hablan de `404`
- ✅Hablan de **dominio**.

### 5. Aquí aparece `HTTPException`

FastAPI proporciona:

```py
from fastapi import HTTTPException

# podriamos hacer:
raise HTTPException(
    status_code:404,
    detail="El usuario no existe."
)
```

Y FastAPI automaticamente generaria una respuesta HTTP.

#### EJEMPLO:

```http
HTTP/1.1 404 Not Found
```

con algo parecido a:

```json
{
  "detail": "El usuario no existe."
}
```

Parece cómodo.

Entonces podrias preguntarte:

> ¿Porque no hacemos simplemente esto dentro del `Service`?

### 6. El Service no debe conocer HTTP

EJEMPLO:

```py
from fastapi import HTTPException

class FavoriteService:
    def add_favorite(self, favorite):
        if not self.user_repository.exists(favorite.user_id):
            raise HTTPException(
                status_code=404,
                detail="El usuario no existe."
            )
```

FUNCIONA? **_SI_**

Pero acabamos de introdur dependencias problematicas porque `FavoriteService` ahora conoce de:

- FastAPI.
- HTTP.
- status_code.
- 404.
- detail.

Eso significa que la logica de negocio esta acoplada con la capa web.

### 7. ¿Que problema genera eso?

Supongamso que queres utilizar `FavoriteService` desde otro lugar.

Por ejemplo:

```text
FastAPI
   ↓
FavoriteService
```

Perfecto. Pero tambien podrias querer

```text
CLI o Script o Worker
   ↓
FavoriteService
```

El Service deberia poder funcionar independientemente de como se invoque.

Pero si contiene `HTTPException`

estamos diciendo:

> "El servicio esta pensado especificamente para HTTP/FastAPI"

Y eso rompe parte de la separacion de responsbilidades que estamos contruyendo.

### 8. La separacion correcta

Queremos

```text
            ┌───────────────┐
            │    FastAPI    │
            │   HTTP layer  │
            └───────┬───────┘
                    ▼
            ┌───────────────┐
            │  Controller   │
            └───────┬───────┘
                    ▼
            ┌───────────────┐
            │    Service    │
            │    dominio    │
            └───────┬───────┘
                    ▼
            ┌───────────────┐
            │  Repository   │
            └───────────────┘
```

El Service deberia pensar: El usurio no existe

No: "Debo devolver HTTP 404"

La traduccion entre ambos mundos la hara la capa HTTP.

### 9. La idea clave

Queremos pasar de:

```py
raise HTTPException(
    status_code=404,
    detail="El usuario no existe."
)
# a
raise UserNotFoundException(
    "El usuario no existe."
)
```

Y posteriormente tendremos algo que transforme:

```text
UserNotFoundException
        ↓
    HTTP 404
```

10. Un ejemplo completo

Imagina esta situación.

Service
class FavoriteService:

    def add_favorite(self, favorite):

        if not self.user_repository.exists(favorite.user_id):
            raise UserNotFoundException(
                "El usuario no existe."
            )

El Service solamente sabe:

Usuario inexistente
Controller

El Controller podría dejar pasar la excepción:

def add_favorite(self, favorite):

    return self.service.add_favorite(favorite)

No necesita convertirla necesariamente en HTTP.

FastAPI

En la capa HTTP podemos convertir:

UserNotFoundException

en:

404 Not Found

Más adelante aprenderemos una forma limpia de hacerlo sin llenar todos los endpoints de try/except.

11. ¿Y qué pasa con CoinGeckoException?

Aquí ya tienes una buena pista en tu proyecto.

Actualmente tienes:

class ApiException(Exception):
"""Excepción base para errores relacionados con APIs."""

class CoinGeckoException(ApiException):
"""Error al comunicarse con CoinGecko."""

Esto ya es una excepción propia.

Pero hay una pequeña confusión conceptual en el nombre ApiException.

No significa necesariamente:

"Error HTTP."

En tu caso representa una familia de errores de tu aplicación relacionados con una API externa.

Por eso podemos evolucionar esta estructura durante el módulo.

12. Dos familias de errores que vamos a distinguir

Una forma conceptual de verlo:

Exception
│
└── AppException
│
├── DomainException
│ ├── UserNotFoundException
│ ├── CoinNotFoundException
│ └── FavoriteAlreadyExistsException
│
└── ExternalServiceException
└── CoinGeckoException

No significa que necesariamente vayamos a implementar exactamente esta jerarquía ahora mismo. Primero vamos a entenderla.

La idea importante es:

los errores tienen significado propio antes de convertirse en HTTP.

13. ¿Entonces dónde pertenece HTTPException?

En nuestra arquitectura:

HTTPException
↓
capa HTTP / API

No:

HTTPException
↓
Service

Porque HTTPException describe una respuesta HTTP.

Mientras que:

UserNotFoundException

describe una situación del dominio.

14. Una analogía sencilla

Imagina que estás en un restaurante.

El cocinero descubre:

"No quedan tomates."

Eso es un problema del dominio del restaurante.

No debería decir:

"HTTP 404."

😂

El camarero puede traducir ese problema para el cliente:

"Lo siento, ese plato no está disponible."

La misma idea existe en nuestro backend.

Service
Usuario no existe
Capa HTTP
HTTP 404

Cada capa traduce el problema a su propio lenguaje.

15. ¿Qué ganamos?

Con excepciones propias conseguimos:

Antes
success, message = service.add_favorite(...)

y después:

if "usuario no existe" in message:

Esto es frágil.

Después
try:
service.add_favorite(...)

except UserNotFoundException:
...

Ahora el programa trabaja con tipos, no con textos.

Eso es muchísimo más robusto.

16. Regla que quiero que te quedes

Para este módulo, memoriza esta frase:

El Service comunica problemas del dominio; la capa HTTP decide cómo representarlos en HTTP.

Por eso:

❌ Service → HTTPException

y:

✅ Service → UserNotFoundException
↓
capa HTTP
↓
HTTP 404 17. Mini ejercicio mental

Antes de pasar a la siguiente lección, quiero que puedas clasificar estos errores:

Situación Tipo
Usuario inexistente Excepción de dominio
Moneda inexistente Excepción de dominio
Favorito duplicado Excepción de dominio
CoinGecko no responde Excepción de servicio externo
HTTP 404 Representación HTTP
HTTP 409 Representación HTTP

La clave es que 404 y 409 no son realmente las reglas del dominio. Son códigos que HTTP utiliza para comunicar hacia fuera lo que ocurrió.


