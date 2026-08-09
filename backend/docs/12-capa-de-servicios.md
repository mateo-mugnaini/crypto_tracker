# Módulo 12 - Diseño de una capa de servicios profesional

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## ¿Qué es una capa de servicios?

La capa de servicios contiene la lógica de negocio de la aplicación.

Su responsabilidad es realizar una tarea específica, como obtener información desde una API, procesar datos o coordinar distintas operaciones.

No debe encargarse de mostrar información por pantalla, interactuar con el usuario o acceder directamente a la base de datos (salvo que esa sea su responsabilidad específica).

En Crypto Tracker, `CoinGeckoService` es el encargado de comunicarse con la API de CoinGecko.

---

## ¿Por qué no debemos crear servicios rígidos?

Un servicio rígido es aquel cuyos valores están escritos directamente en el código.

Ejemplo:

```python
params = {
    "vs_currency": "usd",
    "per_page": 10,
    "page": 1,
}
```

Este código funciona, pero obliga a modificar el servicio cada vez que queremos cambiar la cantidad de resultados, la moneda o el orden.

Un buen servicio debe ser reutilizable.

---

## Diseñando un servicio reutilizable

En lugar de fijar los valores dentro del método, los recibimos como parámetros.

Ejemplo:

```python
def get_market_coins(
    self,
    vs_currency="usd",
    per_page=10,
    page=1,
):
```

Ahora quien utilice el servicio puede decidir qué información necesita.

Ejemplos:

```python
service.get_market_coins()
```

```python
service.get_market_coins(per_page=50)
```

```python
service.get_market_coins(vs_currency="eur")
```

El mismo método sirve para múltiples escenarios sin necesidad de modificar su implementación.

---

## ¿Qué son los parámetros con valores por defecto?

Un parámetro con valor por defecto permite que una función pueda ejecutarse sin necesidad de recibir todos los argumentos.

Ejemplo:

```python
def saludar(nombre="Usuario"):
    print(f"Hola {nombre}")
```

Podemos llamar:

```python
saludar()
```

Resultado:

```text
Hola Usuario
```

O bien:

```python
saludar("Mateo")
```

Resultado:

```text
Hola Mateo
```

Esto hace que las funciones sean más flexibles y fáciles de reutilizar.

---

## ¿Qué son las anotaciones de tipo?

Las anotaciones de tipo indican qué tipo de dato espera recibir una función y qué tipo devuelve.

Ejemplo:

```python
def sumar(a: int, b: int) -> int:
    return a + b
```

Las anotaciones:

- Mejoran la legibilidad.
- Ayudan al autocompletado del IDE.
- Facilitan el mantenimiento del código.
- Permiten utilizar herramientas de análisis estático.

Es importante recordar que Python no obliga a cumplir estos tipos en tiempo de ejecución; son una ayuda para el desarrollador.

---

## Principio de Responsabilidad Única (SRP)

Uno de los principios SOLID establece que una clase debe tener una única responsabilidad.

En nuestro proyecto:

- `CoinGeckoService` obtiene datos desde la API.
- `CoinMapper` transforma esos datos en objetos.
- `Coin` representa una criptomoneda.

Cada componente tiene un único objetivo.

Esta separación facilita el mantenimiento y las futuras modificaciones.

---

## Flujo actual de la aplicación

El recorrido de los datos es el siguiente:

```text
main.py

↓

CoinGeckoService

↓

CoinGecko API

↓

JSON

↓

CoinMapper

↓

Coin

↓

Consola
```

Cada capa realiza una única tarea y entrega el resultado a la siguiente.

---

## Beneficios de esta arquitectura

Al separar responsabilidades obtenemos varias ventajas:

- Código más limpio.
- Métodos reutilizables.
- Mayor facilidad para realizar pruebas.
- Menor acoplamiento entre componentes.
- Mejor mantenimiento a largo plazo.

A medida que el proyecto crezca e incorpore MySQL, FastAPI y React, esta organización permitirá agregar nuevas funcionalidades sin tener que reescribir el código existente.

---

## Resumen

Después de este módulo nuestro servicio es más flexible que al comienzo.

Ya no depende de valores fijos y puede reutilizarse para distintos escenarios simplemente modificando los parámetros recibidos.

Además, comenzamos a aplicar principios de diseño utilizados en proyectos profesionales, preparando la base para las siguientes etapas del desarrollo de Crypto Tracker.
