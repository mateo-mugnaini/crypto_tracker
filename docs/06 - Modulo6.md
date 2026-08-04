# Módulo 6 - Manejo de errores y excepciones en Python

> ### Objetivos
>
> Al finalizar este módulo entenderás:
>
> - Qué son las excepciones.
> - Diferencia entre error y excepción.
> - Cómo usar try / except.
> - Cómo crear errores personalizados.
> - Cómo aplicaremos esto a CoinGecko.

## Clase 1 - ¿Qué es una excepción?

Una excepción es un evento que interrumpe la ejecución normal del programa.

```py
# Ejemplo:
number = 10
result = number / 0

# Esto falla porque matemáticamente no se puede dividir por cero.
# Python devuelve: ZeroDivisionError

# Otro ejemplo:

age = int("hola")

# Python intenta convertir:
# hola → número
# No puede.
# Resultado: ValueError
```

**¿Qué pasa si no manejamos el error?**

```py
# Ejemplo:

def dividir(a, b):
return a / b

print(dividir(10, 0))

print("Programa terminado")

# La ejecución se detiene:
# ZeroDivisionError
# Nunca llega a:

print("Programa terminado")

# En una aplicación real esto sería un problema.

# Imagina:
# Usuario
#   ↓
# Consulta Bitcoin
#   ↓
# API falla
#   ↓
# Programa cerrado

```

**No queremos eso.**

## Clase 2 - try / except

Python utiliza:

`try`: código que puede fallar

`except`: qué hacer si falla

```py
# Ejemplo:

def dividir(a, b):
    try:
        return a / b
    except:
        return "No se puede dividir"
# Ahora:

print(dividir(10, 0))

# Resultado:
# No se puede dividir
# El programa continúa.
```

## Clase 3 - Capturar errores específicos

Aunque funciona, esto:

except:

no es recomendable.

`¿Por qué?`

Porque captura absolutamente todo.

Es demasiado general.

Mejor:

```py
def dividir(a, b):

    try:
        return a / b

    except ZeroDivisionError:
        return "No se puede dividir por cero"
```

Ahora solo captura ese caso.

Tipos comunes de excepciones

> ### Algunas que veremos:
>
> - ValueError
> - Dato incorrecto.

Ejemplo:

```py
# Tipo incorrecto
int("hola")
TypeError
```

Ejemplo:

```py
# Buscar una clave que no existe.
"hola" + 5
KeyError
```

Ejemplo:

```py
No existe:
# KeyError

coin = {
"name": "Bitcoin"
}

print(coin["price"])
```

Ejemplo:

```py
# FileNotFoundError
# Archivo inexistente.
open("config.txt")
```

**Exception**

Clase base de errores.

Se usa cuando queremos capturar cualquier excepción.

Ejemplo:

```py
except Exception as error:
print(error)
```

## Clase 4 - finally

Existe otro bloque:

`finally`: Se ejecuta siempre.

```py
# Ejemplo:
try:
print("Intentando conexión")

except Exception:
print("Error")

finally:
print("Proceso finalizado")
```

```bash
# Salida:
Intentando conexión
Proceso finalizado
```

**¿Para qué sirve?**

> ### Ejemplos:
>
> - cerrar conexiones;
> - liberar recursos;
> - limpiar archivos temporales.

## Clase 5 - Errores en APIs

Ahora llevémoslo a Crypto Tracker.

Supongamos:

response = api.get_coin("bitcoin")

Puede ocurrir:

| Caso   | Suceso                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------- |
| Cas. 1 | Todo funciona: <br/> CoinGecko <br/> ↓ <br/> 200 OK <br/> ↓ <br/> Datos                           |
| Cas. 2 | Internet falla: <br/> CoinGecko <br/> ↓ <br/> Sin conexión <br/> ↓ <br/> Error                    |
| Cas. 3 | La moneda no existe: <br/> bitcoin123 <br/> ↓ <br/> 404                                           |
| Cas. 4 | La API limita peticiones: <br/> 429 Too Many Requests <br/> - Nuestro código debe controlar esto. |

## Clase 6 - Crear nuestros propios errores

Python permite crear excepciones personalizadas.

```py
# Ejemplo:
# Archivo: exceptions.py
# Código:

class CoinNotFoundError(Exception):
pass

# Ahora tenemos nuestro propio error:

raise CoinNotFoundError()
```

**¿Por qué hacer esto?**

Porque en proyectos grandes queremos errores que tengan significado.

```py
# Ejemplo:
# Malo:
Exception
# Bueno:
CoinNotFoundError
```

Ya sabemos qué ocurrió.

Aplicación a nuestra arquitectura

Más adelante tendremos:

```bash
app/
├── services/
│ └── coingecko_service.py
├── exceptions/
│ └── coin_errors.py
```

```bash

Flujo:

Controller

↓

Service

↓

CoinGecko

↓

Error

↓

Service maneja error

↓

Controller muestra mensaje
Primer ejercicio aplicado
```

Crea:

```
app/

└── error_test.py
```

```py
# Código:
def get_price():

    price = "100000"

    return int(price)

def main():

    try:
        price = get_price()
        print(price)

    except ValueError:
        print("El precio no tiene formato correcto")

if **name** == "**main**":
main()
```

Luego modifica:

```py
price = "bitcoin"
```

**¿Qué ocurre?**

Debería mostrar:

```
El precio no tiene formato correcto
```

Después crea otro ejemplo usando un diccionario:

```py
coin = {
"name": "Bitcoin"
}
print(coin["price"])
```

Intenta capturar el: `KeyError`
