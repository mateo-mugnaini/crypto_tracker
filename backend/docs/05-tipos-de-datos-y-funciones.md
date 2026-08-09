# Módulo 5 - Tipos de datos y funciones

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Variables

Python utiliza tipado dinámico. El tipo de una variable se determina automáticamente.

## Type hints

Permiten documentar qué tipos de datos esperamos recibir y devolver.

Ejemplo:

```python
def sumar(a:int,b:int)->int:
    return a+b
```

## Tipos principales

- str
- int
- float
- bool
- list
- dict
- tuple
- set

## JSON y diccionarios

Las respuestas de APIs generalmente llegan en formato JSON.

Python representa esos datos mediante diccionarios y listas.

Ejemplo:

JSON:

```json
{
  "id": "bitcoin"
}
```

Python:

```python
{
"id":"bitcoin"
}
```

## Importancia en el proyecto

Crypto Tracker trabajará constantemente con listas y diccionarios porque CoinGecko devuelve información estructurada.
