# Módulo 27 - Favorite Service

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

Crear una capa de servicio encargada de gestionar las monedas favoritas de los usuarios.

El Service contiene la lógica de negocio y delega las operaciones de persistencia al Repository.

---

## Responsabilidades del FavoriteService

El servicio permite:

- Agregar una moneda a favoritos.
- Eliminar una moneda de favoritos.
- Obtener todas las favoritas de un usuario.

Toda operación sobre favoritos debería pasar por este servicio.

---

## Arquitectura

El flujo queda así:

```text
Aplicación

↓

FavoriteService

↓

FavoriteRepository

↓

MySQL
```

El Service nunca ejecuta consultas SQL directamente.

---

## Inyección de dependencias

El Repository se recibe mediante el constructor:

```python
class FavoriteService:

    def __init__(self, repository):
        self.repository = repository
```

Esto desacopla la lógica de negocio de la tecnología utilizada para almacenar los datos.

---

## ¿Por qué existe un Service?

Aunque inicialmente solo delegue llamadas al Repository, el Service es el lugar donde se implementarán futuras reglas de negocio, por ejemplo:

- Evitar favoritos duplicados.
- Limitar la cantidad máxima de favoritos.
- Verificar que la moneda exista.
- Registrar auditorías o eventos.

Gracias a esto, el resto de la aplicación no necesita conocer esos detalles.

---

## Principio de responsabilidad única

Cada capa tiene una función específica:

- **Service:** lógica de negocio.
- **Repository:** acceso a la base de datos.
- **Modelo:** representación de la entidad.
- **MySQL:** persistencia.

Esta separación hace que el código sea más fácil de mantener y extender.

---

## Estado del proyecto

Al finalizar este módulo ya contamos con servicios para:

- Gestión de monedas (`CoinService`).
- Historial de precios (`PriceHistoryService`).
- Favoritos (`FavoriteService`).

Cada uno sigue la misma arquitectura basada en Services y Repositories.
