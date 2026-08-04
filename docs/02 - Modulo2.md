# Módulo 2 - Preparando el proyecto

Aqui vamos a aprender algo que muchos tutoriales omiten.

NO VAMOS A INSTALAR LIBRERIAS "PORQUE SI"

Primero entenderemos **qué problema resuelve cada una**

## 1. ¿Qué es una dependencia?

Cuando programamos, muchas veces necesitamos funcionalidades que otros desarrolladores ya construyeron.

> ### Por ejemplo:
>
> - hacer una petición HTTP
> - conectarse a MySQL
> - imprimir tablas bonitas en consola
> - leear archivos .env

Podríamos escribir todo eso a mano...

Pero tardarias mas tiempo.

Por eso usamos librerías.

En python las librerías se instalan mediante `pip`

---

COMPARACION NODE vs PYTHON

```bash
NODE
npm install axios
```

```bash
PYTHON
pip install httpx
```

la idea es exactamente la misma

## 2. ¿Qué es requirements.txt?

En Node tenemos: `package.json`

En Python normalmente se usa `requirements.txt`

```txt
fastapi==0.118.0
httpx==0.28.1
rich==14.1.0
```

Cuando otra persona descarga el proyecto solo ejecuta:

```
pip install -r requirements.txt
```

### `¿Por qué no subir la carpeta .venv a GitHub?`

Imagina que .venv pesa aproximadamente 200 MB.

¿Tiene sentido subirlo?

No.

Porque cualquier persona puede reconstruirlo haciendo:

pip install -r requirements.txt

Por eso nunca se versiona.

## 3. ¿Qué es Git?

Git guarda el historial del proyecto.

No guarda únicamente el código.

> ### Guarda:
>
> - quién hizo cambios
> - cuándo
> - qué cambió
> - permite volver atrás

Es como la función Ctrl + Z, pero para todo el proyecto.

---

### Paso 1 - Inicializar Git

Desde la carpeta backend ejecuta:

```bash
git init
```

Deberías obtener algo parecido a:

```bash
Initialized empty Git repository...
```

---

### Paso 2 - Crear .gitignore

Crea un archivo llamado:

```bash
.gitignore
```

Con este contenido:

```bash
# Virtual Environment

.venv/

# Python

**pycache**/
_.py[cod]
_.pyo

# Environment

.env

# IDE

.vscode/
.idea/

# OS

.DS_Store
Thumbs.db

# Testing

.pytest_cache/

# Logs

\*.log
```

---

### ¿Qué hace .gitignore?

Le dice a Git:

> "Estos archivos existen, pero no quiero subirlos al repositorio."

Por ejemplo:

```bash

.venv/

↓

Git lo ignora.
```

## 4 ¿Qué vamos a instalar?

Todavía NO instalaremos FastAPI.

Porque todavía no estamos construyendo una API.

Vamos a instalar únicamente lo que necesitamos hoy.

### - httpx

```bash
pip install httpx
```

### ¿Para qué sirve?

- Hacer peticiones HTTP

> ### Ejemplo
>
> ```bash
> Python
>
> ↓
>
> httpx
>
> ↓
>
> CoinGecko
> ```

Es el equivalente a Axios en React o Node.

---

### - Rich

```bash
pip install rich
```

### ¿Para qué sirve?

- Rich permite que la consola deje de verse así:

  ```bash
   Bitcoin

   Precio

   100000
  ```

  y pase a verse así:

  ```py
  ┌──────────────┐
  │ Bitcoin      │
  │ $100.000     │
  └──────────────┘
  ```

  Además permite:

- colores
- tablas
- barras de progreso
- paneles
- mensajes de error más claros

---

### - python-dotenv

```bash
pip install python-dotenv
```

Más adelante necesitaremos cosas como:

```bash
DATABASE_URL

API_KEY

SECRET_KEY
```

No queremos escribirlas dentro del código.

Por eso usamos un archivo: `.env`

Esta librería carga automáticamente esas variables.

## INSTALAR DEPENDENCIAS

se pueden instalar de a una

```bash
pip install httpx
```

```bash
pip install rich

```

```bash
pip install python-dotenv

```

o todas juntas

```bash
pip install httpx rich python-dotenv

```

## Generar requirements.txt

Ahora ejecutamos:

```bash
pip freeze > requirements.txt
```

### ¿Que hace `pip freeze`?

Mira todoas las librerias instaladas en el entorno virtual y genera un listado:

```bash
httpx==0.28.1
python-dotenv==1.1.1
rich==14.1.0
...
```

## Primer commit

Cuando todo esté listo:

```bash
git add .
```

Luego:

```bash
git commit -m "chore: initial project setup"
```

¿Por qué escribir mensajes como este?

En proyectos profesionales los commits suelen seguir una convención.

```bash
# Por ejemplo:
feat: # Nueva funcionalidad.

fix: # Corrección de errores.

docs: # Cambios en documentación.

refactor: # Mejora del código sin cambiar su comportamiento.

test: # Pruebas.

chore: # Tareas de mantenimiento o configuración del proyecto.
```

Nuestro primer commit es una configuración inicial, por eso usamos chore:.
