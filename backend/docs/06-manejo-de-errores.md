# Módulo 6 - Manejo de errores

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## ¿Qué es una excepción?

Una excepción es un evento que altera la ejecución normal del programa.

Ejemplos:

- división por cero;
- datos inválidos;
- claves inexistentes;
- errores de conexión.

## try / except

Permite capturar errores y evitar que el programa termine inesperadamente.

Ejemplo:

```python
try:
    código

except Error:
    manejo
```

## Excepciones específicas

Es recomendable capturar errores concretos:

- ValueError
- TypeError
- KeyError
- FileNotFoundError

## Aplicación en Crypto Tracker

Las APIs externas pueden fallar.

El backend debe controlar:

- errores de conexión;
- respuestas inválidas;
- monedas inexistentes;
- límites de la API.

## Excepciones personalizadas

Crear errores propios permite que el código sea más descriptivo.

Ejemplo:

```python
class CoinNotFoundError(Exception):
    pass
```
