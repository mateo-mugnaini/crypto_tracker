# Módulo 1 - Preparación del entorno

> ## OBJETIVOS
>
> - Repositorio creado.
> - Estructura inicial del proyecto.
> - Entorno virtual de python.
> - Git configurado.
> - Primeras dependencias instaladas.
> - Documentación inicial.

## ¿Qué es un entorno virtual?

En javascript seguramente has hecho

```bash
npm install
pnpm install
```

Y aparece una carpeta llamada `node_modules` <br/>

Ahí viven las dependencias de tu proyectos

En Python exsite un concepto parecido, pero funciona de otra forma.

Cada computadora tiene un Python global.

Si instalas una libreria, la instalas de forma global:

```bash
pip install requests
```

> ## Esto genera un problema:
>
> - un proyecto necesita una versión.
> - otro necesita otra versión.
> - actualizar una rompe otro proyecto.

Por eso existen los **ENTORNOS VIRTUALES** (`venv`)

Un entorno virtual crea una instalación de Python aislada para un único proyecto.

Así, cada proyecto tiene sus propias dependencias.

## Comparación con Node.js

```node
Proyecto

│

node_modules/

package.json
```

```python
Proyecto

│

.venv/

requirements.txt
```

La idea es muy similar: aislar las dependencias del proyecto.
