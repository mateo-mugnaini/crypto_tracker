# Módulo 8 - Arquitectura del proyecto

## ¿Qué es arquitectura?

Es la forma en que organizamos las diferentes partes de una aplicación para separar responsabilidades.

## Capas del proyecto

### Models

Representan entidades del sistema.

Ejemplo:

Coin.

### Services

Contienen lógica de negocio.

Ejemplo:

Consultar información de criptomonedas.

### Repositories

Se encargan del acceso a datos.

Ejemplo:

Guardar información en MySQL.

### Controllers

Gestionan las entradas y salidas del sistema.

Ejemplo:

Endpoints HTTP.

### Database

Contiene configuración y conexión con la base de datos.

### Config

Guarda configuraciones generales.

### Exceptions

Contiene errores personalizados.

## Objetivo

Mantener el código organizado, escalable y fácil de mantener.
