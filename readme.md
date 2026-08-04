# CRYPTO TRACKER

## Reglas del proyecto

Vamos a trabajar como si estuviéramos desarrollando un proyecto profesional.

- No escribiremos código "rápido" si sabemos que luego habrá que rehacerlo.
- Cada archivo tendrá una única responsabilidad.
- Todo estará documentado.
- Utilizaremos nombres claros.
- Aplicaremos principios SOLID cuando tenga sentido, sin complicar innecesariamente el proyecto.
- El código será escalable para que agregar React o nuevas funcionalidades no implique reescribir el backend.

## Tecnologías elegidas

### `BACKEND`

- Python 3.13+
- FastAPI (mas adelante)
- HTTPX (en lugar de `requests`, por ser un cliente HTTP más moderno y compatible con FastAPI)
- Pydantic
- SQLAlchemy
- Alembic
- MySQL
- `python-dotenv`
- Rich (para una consola más agradable)
- Pytest

### `FRONTEND`

- React
- Axios
- React Router
- MUI

## Tecnologías elegidas

Cuando terminemos el proyecto tendrá una estructura similar a esta:

```
crypto-tracker/
│
├── app/
│ ├── config/
│ ├── controllers/
│ ├── services/
│ ├── repositories/
│ ├── database/
│ ├── models/
│ ├── schemas/
│ ├── menu/
│ ├── utils/
│ └── main.py
│
├── docs/
│
├── tests/
│
├── .env
├── .gitignore
├── requirements.txt
├── README.md
└── CHANGELOG.md

```

No todas las carpetas existirán desde el primer día; las iremos incorporando cuando realmente sean necesarias.

---

## Roadmap

### Módulo 1 — Preparación del entorno

- Instalar Python.
- Instalar VS Code (si hiciera falta).
- Crear el proyecto.
- Crear el entorno virtual.
- Instalar dependencias.
- Configurar Git.
- Crear la estructura inicial.

  ### Módulo 2 — Fundamentos de Python

- Módulos.
- Paquetes.
- Imports.
- Funciones.
- Tipado.
- Organización del código.

### Módulo 3 — Menú interactivo

- Crear un menú en consola.
- Separar responsabilidades.
- Primer controlador.

### Módulo 4 — Consumo de CoinGecko

- Peticiones HTTP.
- JSON.
- Manejo de errores.
- Mostrar datos formateados.

### Módulo 5 — Persistencia

- Diseño de la base de datos.
- MySQL.
- SQLAlchemy.
- Alembic.

### Módulo 6 — FastAPI

- Endpoints.
- Documentación Swagger.
- Validaciones.
- Arquitectura REST.

### Módulo 7 — React

- Consumir el backend.
- Dashboard.
- Favoritos.
- Historial.
- Buscador.

---

## El resultado

Cuando terminemos tendrás:

- Un backend profesional en Python.
- Una API REST lista para producción (a pequeña escala).
- Un frontend en React.
- Documentación técnica completa.
- Material de estudio en Markdown.
- Un proyecto sólido para tu portfolio.
- Una base que podrás reutilizar en futuros proyectos.
