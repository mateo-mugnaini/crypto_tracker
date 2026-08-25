# Crypto Tracker

Proyecto didactico de backend para aprender Python con una arquitectura profesional y progresiva.

## Estado actual

- Backend en Python con consumo de CoinGecko.
- Capa de configuracion, API, servicio, repositorio y base de datos separadas.
- Pruebas unitarias aisladas sin red ni MySQL real.
- Frontend inicial con React, TypeScript y Vite; autenticación y dashboard de monedas en progreso.

## Estructura principal

```text
backend/
  app/
  docs/
  requirements.txt
  README.md
frontend/
  src/
  package.json
  README.md
```

## Documentacion del curso

La ruta didactica esta en `docs/` y avanza por modulos.

## Ejecutar el backend

```bash
cd backend
python -m uvicorn app.api.app:app --reload --host 127.0.0.1 --port 8000
```

## Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible normalmente en `http://localhost:5173` y consume
la API mediante `VITE_API_BASE_URL`.

## Ejecutar las pruebas

```bash
cd backend
python -m unittest discover -s app/tests -p "*_test.py"
```
