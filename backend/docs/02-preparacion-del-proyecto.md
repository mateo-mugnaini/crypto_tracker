# Módulo 2 - Preparación del proyecto

## ¿Qué es una dependencia?

Una dependencia es una librería creada por terceros que resuelve un problema específico y que podemos reutilizar en nuestro proyecto.

## ¿Qué es pip?

`pip` es el gestor de paquetes oficial de Python.

Permite instalar, actualizar y eliminar librerías.

Ejemplo:

```bash
pip install httpx
```

## ¿Qué es `requirements.txt`?

Es el archivo que registra las dependencias del proyecto y sus versiones.

Gracias a él cualquier desarrollador puede reconstruir el entorno ejecutando:

```bash
pip install -r requirements.txt
```

## ¿Qué es `.gitignore`?

Es un archivo que indica a Git qué elementos no deben formar parte del repositorio.

Ejemplos comunes:

- `.venv/`
- `.env`
- `__pycache__/`

## Dependencias instaladas

### httpx

Cliente HTTP moderno para realizar peticiones a APIs.

### Rich

Permite crear una salida de consola más legible y atractiva mediante tablas, paneles, colores y otros componentes.

### python-dotenv

Carga variables de entorno desde un archivo `.env`, evitando almacenar información sensible directamente en el código.

## Buenas prácticas

- Mantener `requirements.txt` actualizado.
- No subir `.venv` al repositorio.
- No versionar el archivo `.env`.
- Escribir mensajes de commit claros y consistentes.
