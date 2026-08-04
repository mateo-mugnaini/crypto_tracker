# Módulo 4 - Módulos y paquetes en Python

## ¿Qué es un módulo?

Un módulo es un archivo Python (`.py`) que contiene código reutilizable.

Puede contener:

- funciones
- variables
- clases

## ¿Qué es un paquete?

Un paquete es una carpeta que agrupa varios módulos relacionados.

Ejemplo:

```
services/

├── crypto_service.py
└── user_service.py
```

`services` es un paquete.

## Importaciones

Python permite importar código de otros módulos.

Ejemplo:

```python
from utils import mostrar_titulo
```

También:

```python
import utils
```

## ¿Por qué modularizar?

Separar el código permite:

- mantener archivos pequeños;
- reutilizar funciones;
- facilitar pruebas;
- escalar el proyecto.

## Relación con Node.js

Python:

```
archivo.py
```

JavaScript:

```
archivo.js
```

Ambos representan módulos reutilizables.

## **init**.py

Este archivo indica que una carpeta puede comportarse como un paquete Python.

Aunque no siempre es obligatorio actualmente, es una práctica común en proyectos profesionales.
