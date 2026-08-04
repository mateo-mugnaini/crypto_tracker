# Módulo 8 - Arquitectura inicial de Crypto Tracker

> ### Objetivo
>
> - Vamos a diseñar la estructura que utilizaremos para todo el proyecto.
> - No vamos a crear carpetas porque "queda profesional".
> - Cada carpeta tendrá una responsabilidad.

---

### ¿Qué es arquitectura?

Arquitectura es la forma en que organizamos las partes de una aplicación.

Un ejemplo simple:

```shell
Usuario
  ↓
Interfaz
  ↓
Backend
  ↓
Base de datos
```

Cada parte tiene su resposabilidad.

---

En nuestro caso:

```shell
React
  ↓
Backend Python
  ↓
CoinGecko API
  ↓
MySQL
```

Cada parte tiene su resposabilidad.

---

### Nuestra aplicación completa

Cuando terminemos tendremos algo parecidog a esto:

```shell
Crypto Tracker

Frontend
(React)
  ↓
Backend
(Python)
  ↓
Services
  ↓
CoinGecko API
  ↓
Database
  ↓
MySQL
```

---

### Primera decisión importante

¿Dónde ponemos la lógica?

Un error común sería hacer:

```py
#main.py
llamar API
guardar datos
mostrar resultados
```

Al principio funciona
Pero después:

```py
#main.py
500 líneas
1000 líneas
2000 líneas
```

---

Separación de responsabilidad
Vamos a dividir:

```shell
app/
 ├── main.py
 ├── models/
 ├── services/
 ├── repositories/
 ├── controllers/
 ├── database/
 ├── config/
 └── exceptions/
```

Ahora veremos cada una.

---

### 1. main.py

RESPONSABILIDAD:

> Iniciar la aplicación

Nada más

```py
# Ejemplo:

def main():
    print("Crypto Tracker iniciado")

# No debería saber:
- cómo llamar CoinGecko;
- cómo guardar en MySQL;
- cómo procesar monedas.
```

### 2. models/

Aquí viven nuestras entidades.

```shell
# Ejemplo:
models/
  └── coin.py
```

Representa:

```shell
Coin
```

Una moneda.

```py
# Ejemplo:
class Coin:
    name
    symbol
    price
```

### 3. service/

Esta será una de las carpetas más importantes.

Contiene la lógica de negocios

```shell
# Ejemplo:
services/
  └── crypto_service.py
```

Responsabilidad:

> "Obtener información de criptomonedas".

```py
# Ejemplo:
class CryptoService:
    def get_top_coins(self):
        pass
```

---

No sabe nada de:

- consola.
- react.
- base de datos.

Solo sabe hacer su trabajo.

### 4. repositories/

Esta carpeta manejará datos persistentes.

```shell
# Ejemplo:
repositories/
  └── coin_respository.py
```

Responsabilidad:

> Hablar con MySQL

```py
# Ejemplo:
class CoinRepository:
    def save(self, coin):
        pass
```

El service dice:

> Guarda esta moneda.

El repository responde:

> Yo sé cómo guardarla.

### 5. controllers/

Más adelante cuando tengamos API REST:

```shell
# Ejemplo:
repositories/
  └── coin_respository.py
```

Será la capa que recibe solicitudes.

Ejemplo:

Usuario:

```shell
GET /coins
```

Controller:

```py
get_coins()
```

Service:

```py
buscar monedas
```

Repository:

```py
guardar datos
```

### 6. database/

Configuración de MySQL

```shell
# Ejemplo:
database/
   ├── connection.py
   └── models.py
```

Aquí estará:

- conexión
- configuración
- sesiones

### 7. config/

Configuraciones generales

```shell
# Ejemplo:
config/
   └── settings.py
```

Aquí tendremos:

- API keys
- variables de entorno
- configuración del proyecto

### 8. exceptions/

Errores personalizados

```shell
# Ejemplo:
exceptions/
   └── coin_errors.py
```

Aquí:

```py
# Ejemplo:
class CoinNotFoundError(Exception):
    pass
```

---

Nuestra estructura actualizada deberia verse asi:

```bash
backend/
    └── app/
        ├── main.py
        ├── models/
        │       └── __init__.py
        ├── services/
        │       └── __init__.py
        ├── repositories/
        │       └── __init__.py
        ├── controllers/
        │       └── __init__.py
        ├── database/
        │       └── __init__.py
        ├── config/
        │       └── __init__.py
        └── exceptions/
                └── __init__.py
```

## ¿Por qué creamos **`__init__`**.py?

Recuerda que un Archivo `__init__.py` indica:

> Esta carpeta pertenece al paquete Python

Aunque Python moderno puede funcionar sin él, nosotros lo utilizaremos para mantener una estructura clara

