# Modulo 36 - Integracion de Controllers

Junto con:

- CoinController.
- FavoriteController.
- PriceHistoryController.

Peeerooo. `main.py` todavia ejecuta logica directamente. En este modulo vamos a centralizar la creacion de dependencias y utilizar los Controllers como punto de entrada de la aplicacion.

## 1. Objtetivo

Vamos a pasar de algo como:

```text
main.py
   ↓
Service
   ↓
Repository
```

a

```text
main.py
   ↓
Controller
   ↓
Service
   ↓
Repository
```

El `main.py` deberia encargarse principalmente de configurar la aplicacion y sus dependencias no de contener logica de negocio.


## 2. Creamos un punto de composicion

Creamos: [container.py]()