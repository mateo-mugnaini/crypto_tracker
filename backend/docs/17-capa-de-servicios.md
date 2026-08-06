# Módulo 17 - Capa de Servicios (Service Layer)

## Objetivo del módulo

En este módulo incorporamos la **capa de servicios**, una de las piezas fundamentales de una arquitectura backend por capas.

Hasta ahora el proyecto ya era capaz de:

- Consumir información desde CoinGecko.
- Conectarse a MySQL.
- Guardar información mediante un Repository.

Sin embargo, todavía no existía una capa encargada de coordinar la lógica del negocio.

---

# ¿Qué es una Service Layer?

La Service Layer (capa de servicios) contiene las reglas de negocio de la aplicación.

Su responsabilidad es coordinar el trabajo entre otras capas.

Por ejemplo:

- Obtener información desde una API.
- Validar datos.
- Crear objetos del dominio.
- Decidir cuándo guardar información.
- Coordinar varias operaciones.

No debe contener código SQL.

Tampoco debería conocer detalles internos de la base de datos.

---

# Arquitectura por capas

Después de este módulo la arquitectura queda organizada de la siguiente manera:

```text
Main / Test
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Database
```

Cada capa tiene una única responsabilidad.

---

# Responsabilidades

## Model

Representa una entidad del dominio.

Ejemplo:

- Coin
- User

No realiza consultas ni llamadas HTTP.

---

## Repository

Su única responsabilidad es acceder a la base de datos.

Ejemplos:

- INSERT
- UPDATE
- DELETE
- SELECT

No debería contener reglas del negocio.

---

## Service

Coordina el comportamiento de la aplicación.

Puede:

- consultar APIs externas;
- utilizar uno o varios repositories;
- transformar datos;
- aplicar validaciones.

No debería escribir SQL directamente.

---

# Separación de responsabilidades

Una arquitectura bien separada facilita:

- mantenimiento;
- pruebas unitarias;
- reutilización del código;
- futuras modificaciones.

Cada clase tiene un único motivo para cambiar.

Este principio está relacionado con el **Single Responsibility Principle (SRP)** de SOLID.

---

# Dependency Injection

Una buena práctica consiste en recibir las dependencias desde el constructor en lugar de crearlas dentro de la clase.

Ejemplo conceptual:

```python
class CoinService:

    def __init__(self, repository):
        self.repository = repository
```

De esta forma el servicio no depende de una implementación concreta.

En el futuro podremos reemplazar el Repository por otra implementación sin modificar el Service.

---

# Beneficios

Al separar responsabilidades obtenemos:

- código más limpio;
- menor acoplamiento;
- mayor facilidad para realizar pruebas;
- mejor escalabilidad.

Esta arquitectura es utilizada en la mayoría de aplicaciones backend profesionales.

---

# Flujo actual del proyecto

```text
Usuario
    │
    ▼
Main / Test
    │
    ▼
Service
    │
    ▼
Repository
    │
    ▼
MySQL
```

En los próximos módulos incorporaremos nuevos servicios que consumirán la API de CoinGecko y persistirán la información utilizando esta misma arquitectura.

---

# Resumen

En este módulo aprendimos:

- Qué es una Service Layer.
- Qué responsabilidades tiene cada capa.
- Por qué no debemos mezclar lógica de negocio con acceso a datos.
- Qué es la inyección de dependencias.
- Cómo una arquitectura por capas mejora el mantenimiento y la escalabilidad del proyecto.
