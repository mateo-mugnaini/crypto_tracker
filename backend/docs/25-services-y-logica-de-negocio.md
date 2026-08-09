# Módulo 24 - Services y lógica de negocio

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

En este módulo incorporamos la capa **Service**, responsable de contener la lógica de negocio de la aplicación.

Hasta este punto ya contamos con:

- Modelos.
- Repositories.
- Cliente para la API de CoinGecko.
- Base de datos MySQL.

Ahora necesitamos una capa que coordine todos esos componentes.

---

## Arquitectura

La aplicación comienza a tomar una estructura por capas:

```text
Main

↓

Service

↓

Repository

↓

Database
```

Cada capa tiene una única responsabilidad.

---

## Responsabilidades de cada capa

## Main

Inicia la aplicación y llama a los servicios.

No contiene lógica de negocio.

---

## Service

Contiene las reglas de negocio.

Se encarga de:

- obtener datos desde la API;
- validarlos;
- transformarlos;
- decidir cuándo guardarlos;
- lanzar excepciones cuando ocurre un error.

El Service **no ejecuta consultas SQL**.

---

## Repository

Es la única capa que conoce MySQL.

Su responsabilidad es:

- guardar;
- consultar;
- actualizar;
- eliminar registros.

No conoce reglas de negocio.

---

## CoinService

El servicio recibe sus dependencias desde el exterior.

```python
class CoinService:

    def __init__(self, repository, api_client):
        self.repository = repository
        self.api_client = api_client
```

Esto se conoce como **inyección de dependencias (Dependency Injection)**.

Gracias a esto el servicio no depende de implementaciones concretas y resulta mucho más sencillo de probar y mantener.

---

## Método update_coin()

El método principal del servicio es:

```python
update_coin(coin_id)
```

Su flujo es:

```text
Coin ID

↓

CoinGeckoClient

↓

JSON recibido desde la API

↓

CoinMapper

↓

Objeto Coin

↓

CoinRepository

↓

MySQL
```

Cada componente realiza una única tarea.

---

## CoinMapper

En lugar de crear el objeto `Coin` directamente dentro del servicio, utilizamos un mapper.

Ejemplo:

```python
coin = CoinMapper.to_coin(data)
```

El mapper transforma la respuesta JSON de la API en un objeto del dominio.

Esto evita duplicar código y mantiene el Service más limpio.

---

## Manejo de errores

Si la API no devuelve información de una moneda, el servicio lanza una excepción específica.

Ejemplo:

```python
raise CoinGeckoException(
    f"No se pudo obtener la moneda '{coin_id}'."
)
```

Esto permite que otras capas puedan reaccionar correctamente al error.

---

## Separación de responsabilidades

Cada clase tiene una única función.

```text
CoinGeckoClient

↓

Obtiene datos desde la API

------------------------

CoinMapper

↓

Convierte JSON → Coin

------------------------

CoinService

↓

Coordina todo el proceso

------------------------

CoinRepository

↓

Guarda el objeto en MySQL
```

Esta separación hace que el proyecto sea más mantenible y facilite la realización de pruebas.

---

## Dependency Injection

El servicio no crea sus propias dependencias.

Incorrecto:

```python
self.repository = CoinRepository()
```

Correcto:

```python
service = CoinService(
    repository,
    api_client
)
```

Esto permite reemplazar fácilmente cualquier implementación por otra durante pruebas o futuras mejoras.

---

## Estado del proyecto

Después de este módulo la arquitectura queda:

```text
Main

↓

CoinService

↓

CoinGeckoClient      CoinRepository

        ↓                  ↓

     CoinMapper        MySQL Database

            ↓

         Modelo Coin
```

La lógica de negocio queda completamente separada del acceso a datos y de la comunicación con la API.

---

## Próximo módulo

En el siguiente módulo mejoraremos la sincronización de monedas, evitando registros duplicados y agregando operaciones de actualización cuando sea necesario.
