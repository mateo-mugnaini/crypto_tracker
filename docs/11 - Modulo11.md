# Módulo 11 - Configuración y manejo profesional de errores

> ### Objetivos
>
> - Comprender qué es una variable de entorno.
> - Utilizar un archivo .env.
> - Centralizar la configuración del proyecto.
> - Configurar timeouts.
> - Manejar errores de red correctamente.
> - Crear excepciones personalizadas.
> - Evitar "hardcodear" valores en el código.

## Clase 1 - ¿Qué significa "HARDCODEAR"?

Oberserva este código:

```py
url= "https://api.coingecko.com/api/v3"
```

Funciona? SI....

Perso imagina que mañana quieres usar otra API?

Ahora debes buscar esa URL en todos los archivos del proyecto.

No es escalable.

### SOLUCIÓN?

Toda la configuracion debe vivir en un único lugar.

Por ejemplo:

```shell
config/
    └── settings.py
```

Así, si la URL cambia, modificamos un único archivo.

---

## Clase 2 - Variables de entorno

Supongamos que más adelante utilizaremos MySQL

Necesitaremos algo asi:

```shell
Host

Usuario

Contraseña

Puerto
```

¿Tiene sentido escribir la contraseña dentro del código?

```py
PASSWORD="123456"
```

### ⛔⛔No⛔⛔

Por dos motivos:

- Es inseguro.
- Cambia según el entorno (desarrollo, pruebas o producción).

Por eso existen las variables de entorno.

---

### Clase 3 - El archivo `.env`

```
backend/
.env
```

Contenido:

```js
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
REQUEST_TIMEOUT=10
```

Por ahora tendremos solo dos variables.

Más adelante agregaremos:

- MySQL.
- JWT.
- Claves secretas.
- Configuración del servidor.

---

## Clase 4 - Instalar python-dotenv

Necesitamos una librería que lea el archivo .env.

Instala:

```bash
pip install python-dotenv
```

Luego actualiza el requrements.txt:

```bash
pip freeze > requirements.txt
```

Ahora deberías ver una línea similar a: `python-dotenv==...`

---

## Clase 5 - Crear Settings

Archivo: `app/config/settings.py`

Código: [VER CODIGO](../backend/app/config/settings.py)

### Analicemos

Primero:

```py
load_dotenv()
```

Carga todas las variables del archivo `.env`.

Después:

```py
os.getenv("COINGECKO_BASE_URL")
```

Busca:

```env
COINGECKO_BASE_URL
```

y devuelve: `https://api.coingecko.com/api/v3`

Observa este detalle:

```py
os.getenv("REQUEST_TIMEOUT", 10)
```

El segundo parámetro es un valor por defecto.

Si la variable no existe: `REQUEST_TIMEOUT`

Python utilizará: `10`

## Clase 6 - Utilizar Settings

Antes teníamos:

class CoinGeckoService:

```py
    BASE_URL = "https://api.coingecko.com/api/v3"
```

Ahora será:

```py
import requests

from config.settings import Settings

class CoinGeckoService:

    BASE_URL = Settings.COINGECKO_BASE_URL
```

Ya no hay ninguna URL escrita directamente en el código.

## Clase 7 - Configurar un timeout

Hasta ahora hacemos:

```py
response = requests.get(url)
```

Problema.

### ¿Qué pasa si CoinGecko tarda un minuto?

Nuestro programa queda bloqueado.

### La solución:

```py
response = requests.get(url, params=params, timeout=Settings.REQUEST_TIMEOUT
)
```

Ahora, si la API tarda más de 10 segundos, requests lanzará una excepción.

## Clase 8 - Manejar errores de red

Actualmente:

```py
response = requests.get(...)
```

puede fallar por muchas razones:

- Sin Internet.
- DNS.
- Timeout.
- API caída.
- Error SSL.

No queremos que la aplicación termine con un `Traceback`.

---

Actualiza el método `get_market_coins`:

```py
import requests

from config.settings import Settings

class CoinGeckoService:

    BASE_URL = Settings.COINGECKO_BASE_URL

    def get_market_coins(self):

        url = f"{self.BASE_URL}/coins/markets"

        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": 10,
            "page": 1,
        }

        try:

            response = requests.get(
                url,
                params=params,
                timeout=Settings.REQUEST_TIMEOUT,
            )

            response.raise_for_status()

            return response.json()

        except requests.exceptions.Timeout:
            print("La petición excedió el tiempo máximo.")

        except requests.exceptions.ConnectionError:
            print("No fue posible conectarse a CoinGecko.")

        except requests.exceptions.HTTPError as error:
            print(f"Error HTTP: {error}")

        except requests.exceptions.RequestException as error:
            print(f"Error inesperado: {error}")

        return []
```

### ¿Qué hace raise_for_status()?

Supongamos que el servidor responde: `404`

Sin:

```py
raise_for_status()
```

`requests` devuelve igualmente un objeto `Response`.

Con: `raise_for_status()`

automáticamente lanza una excepción cuando el código HTTP es 4xx o 5xx.

Es una práctica muy recomendable.

## Clase 9 - Crear excepciones propias

Hasta ahora imprimimos errores.

Más adelante querremos que otras partes del sistema puedan reaccionar a ellos.

Vamos a crear:

```
app/
exceptions/
    api_exception.py
```

Código: [VER](../backend/app/exceptions/api_exception.py)

Todavía no las usaremos, pero estamos preparando la arquitectura.

## Clase 10 - ¿Por qué no imprimimos errores desde los servicios?

Esta es una decisión de arquitectura importante.

Idealmente:

- El Service obtiene datos o lanza excepciones.
- El Controller decide cómo responder.
- La Interfaz decide cómo mostrar el error.

Cada capa tiene una responsabilidad.

Por ahora imprimiremos mensajes porque todavía estamos trabajando desde consola, pero en los próximos módulos iremos eliminando esos `print()` del servicio.
