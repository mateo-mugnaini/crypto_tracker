# Modulo 40 - Validacion de entrada y errores HTTP

Ahora vamos a mejorar la API para que no depende unicamente de validaciones manuales dentro de los services.

La idea sera introducir:

```text
HTTP Request
     │
     ▼
 FastAPI
     │
     │  Validación de parámetros
     ▼
Controller
     │
     │  Manejo de errores
     ▼
 Service
     │
     ▼
Repository
```

Vamos a trabajar principalmente con:

- `Path`.
- `Query`.
- `HTTPExeption`.
- codigos HTTP apropiados(`400`, `404`, `422`, `500`).
- validacion de parametros.
- diferencia entre error de validacion y error de negocio.
- respuestas HTTP coherentes.

Por ejemplo, actualmente tenemos algo como:

```py
@app.post("/coins/{coin_id}")
def update_coin(coin_id: str):
    return container.coin_controller.update_coin(coin_id)
```

En este modulo quermos empezar a controlar cosas como:

```text
/coins/
       ↑
       coin_id vacío/inválido

/coins/bitcoin
       ↑
       válido

y distinguir:
422 → request inválido
404 → recurso no encontrado
400 → operación inválida
500 → error interno
```
