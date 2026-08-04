# Módulo 4 - Módulos y paquetes en Python

> ### Objetivo
>
> Entender
>
> - Qué es un módulo
> - Qué es un paquete
> - Cómo funcionan los imports
> - Cómo separar resposabilidades
> - Por qué nuestra arquitectura tednrá varias carpetas

## Clase 1 - ¿Qué es un módulo?

Un módulo en Python es simplemente un archivo `.py`

> Ejemplo: utils.py

Ese archivo ya es un módulo.

> Dentro puede tener:
>
> - variables
> - funciones
> - clases

```py
# utils.py

def saludar(nombre):
    return f"Hola {nombre}"
```

Luego otro archivo puede utilizarlo.

> Comparación con JavaScript
>
> En JavaScript tienes:
>
> ```js
> utils.js
>
> y haces:
>
> import {saludar} from "./utils.js"
> ```
>
> En Python es equivalente:
>
> ```py
> from utils import saludar
> ```

La idea es la misma:

> Crear código reutilizable y separarlo en archivos pequeños.

## Clase 2 - Nuestro primer módulo

Vamos a modificar nuestra estructura.

Ahora:

```bash
backend/

└── app/

    ├── main.py

    └── utils.py
```

#### Dentro de utils.py coloca:

```py
def mostrar_titulo():
    print("===================================")
    print("          CRYPTO TRACKER")
    print("===================================")
```

Ahora nuestro main.py:

```py
from utils import mostrar_titulo


def main():
    mostrar_titulo()

    print()
    print("¡Bienvenido!")
    print("El proyecto se ha iniciado correctamente.")


if __name__ == "__main__":
    main()
```

Ejecutamos:

```bash
python app/main.py
```

Resultado:

```bash


===================================
          CRYPTO TRACKER
===================================

¡Bienvenido!
El proyecto se ha iniciado correctamente.
```

¿Qué ocurrió?

Python hizo esto:

```bash
main.py

↓

from utils import mostrar_titulo

↓

Busca utils.py

↓

Carga la función mostrar_titulo

↓

La utiliza
```

## Clase 3 - Importar un archivo completo

También podemos hacer:

```py
import utils
```

Entonces usaríamos:

```py
import utils

utils.mostrar_titulo()
```

> ### Ejemplo
>
> ```py
> import utils
> def main():
>   utils.mostrar_titulo()
>
> if __name__ == "__main__"
>   main()
> ```

---

### Diferecnias

| Opcion | formato                          | Descripcion + Ventaja                                                                |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| Op. 1  | from utils import mostrar_titulo | Traes solamente una cosa. <br/> `Ventaja:` Código más corto                          |
| Op. 2  | import utils                     | Traes el módulo completo. <br/> `Ventaja:` Más claro cuando tienes muchos elementos. |

## Clase 4 - ¿Qué es un paquete?

Un paquete es una carpeta que contiene módulos.

> ### Ejemplo
>
> ```bash
> services/
>  ├── crypto_service.py
>  └── user_service.py
> ```

Aqui la carpeta: `services`. Es un **paquete**

Los archivos: `crypto_service.py` y `user_service.py` son módulos

La relación sería:

```bash
# Paquete
services/

    |
    |
    ├── módulo
    crypto_service.py

    └── módulo
    user_service.py
```

### **¿Por qué nos importa?**

Porque nuestro proyecto tendrá esto:

```json
app/
 ├── services/
 │     └── coingecko_service.py
 ├── controllers/
 │     └── crypto_controller.py
 ├── repositories/
 │     └── crypto_repository.py
 ...
```

**`CADA CARPETA SERÁ UN PAQUETE`**

## Clase 5 - El archivo **init**.py

En versiones antiguas de Python era obligatorio crear:

```
services/
   └── __init__.py
```

para indicar:

> Esta carpeta es un paquete Python

Hoy en día python puede funcionar sin él en muchos casos.

Pero en proyectos profesionales todavía se utiliza porque:

- Hace explícita la intención.
- Mejora compatibilidad.
- Permite controlar exports.

Nosotros si lo usaremos.

Nuestra estructura ahora

Actualiza tu proyecto:

```
backend/
   └── app/
        ├── main.py
        ├── utils.py
        └── __init__.py
```

Crea:

```
app/__init__.py
```

Déjalo vacío.

### Algo importante: rutas de importación

Cuando ejecutamos:

````bash
python app/main.py
```bash

Python toma como referencia:

````

app/

````

Más adelante ejecutaremos:

```bash
python -m app.main
````

Esto cambia la forma en que Python interpreta los imports.

`¿Por qué?`

Porque ahí Python entiende:

```
app/
```

como un paquete completo.

Esto será importante cuando tengamos:

```
app.services
app.database
app.controllers
```
