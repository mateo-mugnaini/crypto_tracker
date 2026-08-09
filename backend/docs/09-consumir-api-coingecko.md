# Módulo 9 - Consumir API CoinGecko

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## ¿Qué es una API?

Una API permite que diferentes aplicaciones se comuniquen mediante solicitudes HTTP.

Crypto Tracker utiliza CoinGecko para obtener información de criptomonedas.

## Librería requests

Python utiliza requests para realizar peticiones HTTP.

Ejemplo:

```python
requests.get(url)
```

### requirements.txt

Guarda las dependencias del proyecto.

Permite instalar todas las librerías necesarias mediante:

```bash
pip install -r requirements.txt
```

## Servicios

Los servicios contienen lógica relacionada con una funcionalidad específica.

En **Crypto Tracker**:

CoinGeckoService es responsable de comunicarse con la API externa.

**Flujo actual**

```bash
main.py
    ↓
CoinGeckoService
    ↓
requests
    ↓
CoinGecko API
    ↓
JSON
    ↓
Python dict
```
