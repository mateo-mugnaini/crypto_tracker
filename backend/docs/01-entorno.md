# Módulo 1 - Preparación del entorno

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## ¿Qué es un entorno virtual?

Un entorno virtual (`venv`) es una instalación aislada de Python para un proyecto específico.

Su objetivo es evitar conflictos entre dependencias de distintos proyectos.

## ¿Por qué usar `.venv`?

- Cada proyecto tiene sus propias librerías.
- Se pueden usar distintas versiones de un mismo paquete.
- Facilita compartir el proyecto con otros desarrolladores.

## Comparación con Node.js

Node.js:

- `package.json`
- `node_modules`

Python:

- `requirements.txt`
- `.venv`

Ambos buscan resolver el mismo problema: administrar dependencias.

## Buenas prácticas

- No instalar librerías de forma global.
- Activar el entorno virtual antes de trabajar.
- Mantener `requirements.txt` actualizado.
