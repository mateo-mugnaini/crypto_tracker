# Módulo 81 — Configuración por entornos

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Configuración / Seguridad / Startup  
> **Módulo anterior:** 80 — Logging estructurado  
> **Siguiente módulo:** 82 — Observabilidad

## 1. Problema detectado

Antes de este módulo, todas las ejecuciones usaban el mismo conjunto de variables sin declarar explícitamente si el proceso era de desarrollo, testing o producción.

Eso podía ocultar errores peligrosos:

- usar el secreto placeholder de `.env.example` en producción;
- dejar CORS apuntando a `localhost` en una instancia pública;
- iniciar sin una base de datos de aplicación definida;
- utilizar valores inválidos de timeout, expiración o rate limiting;
- confundir la base de integración con la base normal.

## 2. Entornos soportados

La variable `APP_ENV` acepta:

```text
development
test
production
```

Si no se define, el valor es `development` para conservar la experiencia local actual.

La selección del entorno no cambia automáticamente todas las variables. Define la política de validación y permite que el despliegue falle temprano cuando una configuración de producción es insegura.

## 3. Validación de producción

FastAPI ejecuta `settings.validate_for_runtime()` durante el startup, antes de crear el `Container`.

En `production` se exige:

- `COINGECKO_BASE_URL` no vacío;
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD` y `MYSQL_DATABASE` definidos;
- `JWT_SECRET_KEY` de al menos 32 caracteres y no placeholder;
- `CORS_ALLOWED_ORIGINS` explícito;
- ningún origen `*`, `localhost` o `127.0.0.1`;
- timeout, puerto, expiración JWT y rate limiting positivos;
- pool MySQL válido.

El error solo enumera nombres de variables inválidas. Nunca imprime sus valores.

## 4. Desarrollo y testing

En `development` y `test` la validación de producción no se aplica. Esto permite:

- ejecutar tests unitarios sin credenciales reales;
- usar CORS local;
- omitir `MYSQL_TEST_DATABASE` cuando no se ejecutan integraciones;
- construir objetos `Settings` para pruebas aisladas.

Esto no significa que una configuración inválida sea recomendable. Significa que el entorno local no necesita las mismas garantías operativas que producción.

## 5. Flujo de inicio

```text
Importar settings
       │
       ▼
Leer APP_ENV y variables
       │
       ▼
Crear FastAPI
       │
       ▼
Startup/lifespan
       │
       ├── configurar logging
       ├── validar production
       └── crear Container
```

La validación no ocurre al importar módulos. Esto conserva los tests y herramientas que solo necesitan importar clases o generar documentación.

## 6. Configuración de ejemplo

### Desarrollo

```env
APP_ENV=development
LOG_LEVEL=DEBUG
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MYSQL_DATABASE=crypto_tracker
MYSQL_TEST_DATABASE=crypto_tracker_test
```

### Test

```env
APP_ENV=test
MYSQL_DATABASE=crypto_tracker
MYSQL_TEST_DATABASE=crypto_tracker_test
```

### Producción

```env
APP_ENV=production
LOG_LEVEL=INFO
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
MYSQL_HOST=mysql.internal
MYSQL_USER=crypto_tracker
MYSQL_PASSWORD=provided-by-secret-manager
MYSQL_DATABASE=crypto_tracker
MYSQL_POOL_SIZE=10
MYSQL_POOL_ACQUIRE_TIMEOUT_SECONDS=2
JWT_SECRET_KEY=unique-secret-generated-for-this-environment
CORS_ALLOWED_ORIGINS=https://frontend.example.com
```

Los valores anteriores son una forma de configuración, no credenciales reales. Los secretos deben llegar mediante el mecanismo seguro del entorno de despliegue.

## 7. Seguridad

Separar entornos no reemplaza un secret manager ni permisos de base de datos. La política evita errores comunes, pero todavía deben existir:

- secretos diferentes por entorno;
- usuarios MySQL con privilegios mínimos;
- `.env` fuera del repositorio;
- rotación de secretos;
- configuración de CORS revisada;
- aislamiento de la base de testing.

No se loguean valores de configuración durante la validación.

## 8. Tests

`app/tests/unit/test_settings.py` verifica:

- default a `development`;
- rechazo de un entorno desconocido;
- rechazo de configuración local/placeholder en production;
- aceptación de una configuración explícita segura.

Los tests de aplicación continúan usando el entorno local existente y no necesitan una base adicional para validar la clase `Settings`.

## 9. Errores comunes

- Cambiar `APP_ENV=production` sin definir CORS público.
- Reutilizar el JWT secret de desarrollo.
- Cometer un `.env` real en Git.
- Creer que `APP_ENV` carga automáticamente un archivo `.env.production`.
- Compartir `MYSQL_DATABASE` y `MYSQL_TEST_DATABASE`.
- Imprimir toda la configuración para depurar.
- Usar `CORS_ALLOWED_ORIGINS=*` sin analizar la exposición.

## 10. Comandos

Test de configuración:

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/unit/test_settings.py -q
```

Suite completa:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

## 11. Checklist

- [x] `APP_ENV` agregado.
- [x] Entornos permitidos definidos.
- [x] `LOG_LEVEL` validado.
- [x] Validación de producción agregada.
- [x] Secret placeholder rechazado en production.
- [x] CORS local rechazado en production.
- [x] Variables sensibles nunca incluidas en errores.
- [x] Validación integrada al lifespan de FastAPI.
- [x] Tests unitarios agregados.
- [x] `.env.example` y README actualizados.

## 12. Estado final

M81 queda implementado y verificado. El backend distingue explícitamente sus entornos y falla temprano ante configuraciones inseguras de producción, manteniendo flexibilidad para desarrollo y testing.
