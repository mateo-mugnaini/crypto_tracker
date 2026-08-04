# Módulo 9 - Consumir una API externa con Python (CoinGecko)

> ### Objetivo
>
> Al finalizar vamos a poder
>
> - Instalar librerias.
> - Crear nuestro primer `requirements.txt`.
> - Realizar una petición HTTP.
> - Consumir CoinGecko API.
> - Leer una respuesta JSON.
> - Separar la lógica en un Service.

---

### Clase 1 - ¿Qué es una API?

Una API es una intermediario que permite que dos sistemas se comuniquen.

En nuestro caso:

```bash
Crypto Tracker
    ↓
CoinGecko API
    ↓
Datos de criptomonedas
```

Nuestro programa preguntará:

> "CoinGecko, dame las criptomonedas más importantes"

CoinGecko responderá:

> "Aquí tienes los datos"

Ejemplo real

Si abrimos una URL:

```bash
https://api.coingecko.com/api/v3/ping
```

CoinGecko responde:

```json
{
  "gecko_says": "(V3) To the Moon!"
}
```

Eso es una respuesta JSON.

---

### Clase 2 - HTTP y métodos

Las APIs utilizan principalmente HTTP.

Los métodos más comunes:

| Método | Uso              |
| ------ | ---------------- |
| GET    | Obtener datos    |
| POST   | Crear datos      |
| PUT    | Actualizar datos |
| DELETE | Elimnar datos    |

Para nuestro primer paso usaremos: `GET`

Porque solamente queremos consultar información

---

### Clase 3 - Librería requests

Python no trae una herramienta cómoda para hcer peticiones HTTP.

Por eso utilizaremos: `requests`.

Es una de las librerías más usadas en Python.

---

Primero activemos el entorno.

- Desde: `backend/`
- Debemos tener: `(.venv)` visible

```powershell
(.venv) PS C:\Users\mateo\Projects\crypto_tracker\backend>
```

---

### Instalar requests

Ejecutamos:

```shell
pip install requests

# Deberías ver algo parecido:

Successfully installed requests
```

### Clase 4 - requirements.txt

Ahora aparece algo importante.

Recuerda:

.venv No se sube a Git.

Entonces...

¿Cómo sabe el dev qué installar?

Aquí entra: `requirement.txt`

---

Crear archivo:

```bash
backend/
  ├── requirements.txt
  └── app/
```

Ahora ejecuta:

```bash
pip freeze > requirements.txt
```

Esto genera:

```bash
requests==2.x.x
```

y otras dependencias.

### Clase 5 - Nuestra primera petición

Vamos a crear:

```bash
app/
  └── tests/
        └── api_test.py
```

(Esto es una prueba, después lo moveremos.)

---

Código:

```py
import requests

url = "https://api.coingecko.com/api/v3/ping"

response = requests.get(url)

print(response)
```

Ejecutamos:

```bash
python -m app.tests.api_test
```

Resultado esperado:

```bash
<Response [200]>
```

### ¿Qué significa?

HTTP tiene códigos de respuesta.

### Códigos importantes

| Código | Status              | Ejemplo                   |
| ------ | ------------------- | ------------------------- |
| 200    | Todo correcto       |                           |
| 400    | Petición incorrecta | Mandaste mal un parámetro |
| 401    | No Autorizado       | Falta API_KEY             |
| 404    | No encontrado       | Ruta inexistente          |
| 500    | Error del servidor  |                           |

### Clase 6 - Leer JSON

Ahora cambia:

```py
print(response)
```

por

```py
print(response.json())
```

---

¿Qué hizo Python?

La respuesta: `JSON`

y la convirtio en: `dict`

Por eso podemos hacer:

```py
data= response.json()
print(data["gecko_says"])

```

### Clase 7 - Crear nuestro primer `SERVICE`

Ahora sí vamos a respetar nuestra arquitectura.

Creamos:

```bash
app/
  └── services/
        └── coingecko_service.py
```

CÓDIGO: [VER](../backend/app/services/coingecko_service.py)

Analicemos:

```py
Clase:
  class CoinGeckoService:

# Creamos un servicio especializado
# Su resposabilidad:
# - Comunicarse con CoinGecko.

# Constante BASE_URL
# ¿PORQUÉ?
# Porquetodas las rutas empiezan igual.
# https://api.coingecko.com/api/v3
# Y no queremos repetirlo.

METODO:
  def ping(self):

# Este método realiza una acción:
# Consultar CoinGecko.
```

---

#### Usar nuestro servicio

Ahora modificamos `app/main.py`

CÓDIGO: [VER](../backend/app/main.py)

EJECUTAMOS:

```bash
python -m app.main
```

RESULTADO:

```json
{
  "gecko_says": "(V3) To the Moon!"
}
```

---

### Lo que acabamos de construir

Observa el flujo:

```shell
main.py
  ↓
CoinGeckoService
  ↓
requests
  ↓
CoinGecko API
  ↓
JSON
  ↓
Python dict
```

Esta es la base de todos los backend.

---

### Primer refactor

Actualmente:

```py
response = requests.get(url)
```

puede fallar.

Ejemplo:

- sin internet.
- API caída.
- timeout.

Entonces aplicaremos lo aprendido en el [MÓDULO 6](./06%20-%20Modulo6.md).

Nuestro servicio debería tener:

```py
try:
  # request
except:
  # manejar error

```
