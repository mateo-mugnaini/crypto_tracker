# Módulo 12 - Diseñando una capa de servicios profesional

Hasta ahora nuestro servicio hace 2 cosas:

> CoinGeckoService → requests.get() → return response.json()

Funciona, pero aún no se un servicio `PROFECIONAL`

Analicemos por qué?

---

### EL PROBLEMA

Hoy el método es algo parecido a esto:

```py
def get_market_coins(self):
    response = request.get(...)
    return response.json()
```

**¿Quién decide cuántas monedas traer?**

El propio servicio.

**¿Quién decide la moneda?**

El propio servicio.

**¿Quién decide el orden?**

El propio servicio.

Eso significa una cosa: Es un método poco reutilizable.

---

### UN SERVICIO FLEXIBLE

En lugar de escribir:

```py
"vs_currency": "usd"
"per_page": 10
```

queremos qye quien utilice el servicio puedda decidir esos valores.

```py
# Por ejemplo:

service.get_market_coins()

# o
service.get_market_coins(per_page=50)

# o
service.get_market_coins(vs_currency="eur")
```

SIN MODIFICAR EL SERVICIO

---

### Refactorizando el método

El nuevo método se veria algo así:

```py
def get_market_coins(self, vs_currency: str = "usd", per_page:int = 10, page: int = 1, order: str = "market_cap_desc"):
    url = f"{self.BASE_URL}/coins/markets"

    params = {
        "vs_currency": vs_currency,
        "order": order,
        "per_page": per_page,
        "page": page,
    }

    try:
        response = requests.get(
            url,
            params = params,
            timeout = Settings.REQUEST_TIMEOUT
        )

        response.raise_for_status()
        return response.json()

        except requests.exceptions.Timeout:
            print("La peticion excedió el tiempo máximo.")

        except requests.exceptions.ConnectionError:
            print("No fue posible conectarse con CoinGecko")

        except requests.exceptions.HTTPError as error:
            print(f"Error HTTP: {error}")

        except requests.exceptions.RequestException as error:
            print(f"Error insesperado: {error}")
        return []
```

### ¿QUÉ GANAMOS CON ESTO?

Ahora podemos hacer

```py
service.get_market_coins()

# o
service.get_market_coins(per_page=100)
# o
service.get_market_coins(vs_currency="eur")
# o
service.get_market_coins(
    per_page=20,
    page=2,
)
```

El servicio es mucho más reutilizable.

Tenemos `parametros` por defecto:

```py
def get_market_coins(
    self,
    vs_currency="usd",
    per_page=10,
    page=1,
):
```

Significa que esos calores son los predeterminados

Pero si el usuario decide cambiar puede hacerlo pero si no envia ninguno de estos. Ya poseen un valor y si desea cambiar uno NO afecta al resto.

### ¿Por qué usamos anotaciones de tipo?

Observa:

```py
per_page: int
```

No obliga a Python a validar el tipo en tiempo de ejecución.

Su objetivo es:

- mejorar la legibilidad;
- facilitar el autocompletado del IDE;
- ayudar a herramientas de análisis estático.

Por ejemplo, VS Code podrá sugerirte correctamente los parámetros y advertirte si pasas un tipo incorrecto.
