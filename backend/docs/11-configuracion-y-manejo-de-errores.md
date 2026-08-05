# Módulo 11 - Configuración y manejo de errores

## ¿Por qué no debemos hardcodear valores?

Hardcodear significa escribir valores directamente en el código fuente, por ejemplo una URL, una contraseña o un puerto.

Esto genera problemas porque si esos valores cambian, debemos modificar el código en varios lugares.

La solución consiste en centralizar toda la configuración en un único sitio.

---

## ¿Qué es un archivo `.env`?

Un archivo `.env` almacena variables de configuración del proyecto.

Ejemplo:

```env
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
REQUEST_TIMEOUT=10
```

Estas variables pueden cambiar entre desarrollo, pruebas y producción sin modificar el código.

---

## ¿Qué hace `python-dotenv`?

La librería `python-dotenv` lee el archivo `.env` y carga sus variables para que Python pueda acceder a ellas mediante `os.getenv()`.

---

## Clase `Settings`

La clase `Settings` centraliza la configuración de la aplicación.

En lugar de escribir una URL directamente dentro de un servicio, el servicio consulta la configuración.

Esto hace que el proyecto sea más fácil de mantener y modificar.

---

## ¿Qué es un timeout?

Un timeout define el tiempo máximo que esperamos una respuesta de un servidor.

Si la API no responde dentro de ese tiempo, Python lanza una excepción en lugar de dejar el programa esperando indefinidamente.

---

## ¿Qué hace `raise_for_status()`?

`raise_for_status()` verifica el código HTTP de la respuesta.

Si el servidor devuelve un error (por ejemplo 404 o 500), genera automáticamente una excepción para que podamos manejarla correctamente.

---

## Manejo de excepciones

Las peticiones HTTP pueden fallar por muchos motivos:

- Falta de conexión a Internet.
- Tiempo de espera agotado.
- Error del servidor.
- Dirección incorrecta.

Utilizar `try/except` permite controlar estos errores y evitar que la aplicación finalice inesperadamente.

---

## Excepciones personalizadas

Las excepciones personalizadas permiten representar errores específicos del dominio de la aplicación.

Por ejemplo:

- `ApiException`
- `CoinGeckoException`

En proyectos grandes facilitan el manejo de errores y mejoran la legibilidad del código.

---

## Arquitectura

Después de este módulo, la configuración deja de estar distribuida por el proyecto y pasa a estar centralizada.

El flujo queda así:

`.env`

↓

`Settings`

↓

`CoinGeckoService`

↓

`CoinGecko API`

De esta manera cualquier cambio de configuración se realiza en un único lugar.
