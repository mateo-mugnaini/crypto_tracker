# Crypto Tracker

Proyecto didactico de backend para aprender Python con una arquitectura profesional y progresiva.

## Estado actual

- Backend en Python con consumo de CoinGecko.
- Capa de configuracion, API, servicio, repositorio y base de datos separadas.
- Pruebas unitarias aisladas sin red ni MySQL real.
- Frontend todavia pendiente de implementacion.

## Estructura principal

```text
backend/
  app/
  docs/
  requirements.txt
  README.md
```

## Documentacion del curso

La ruta didactica esta en `docs/` y avanza por modulos.

## Ejecutar el backend

```bash
cd backend
python -m app.main
```

## Ejecutar las pruebas

```bash
cd backend
python -m unittest discover -s app/tests -p "*_test.py"
```
