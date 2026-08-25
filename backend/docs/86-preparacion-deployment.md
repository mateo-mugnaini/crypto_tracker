# Módulo 86 — Preparación para deployment

> **Estado:** PREPARADO Y VERIFICADO
> **Proyecto:** Crypto Tracker - Backend
> **Capa:** Operación / Runtime
> **Módulo anterior:** 85 — Estructura final del backend
> **Siguiente módulo:** 87 — Consumir API desde el frontend

## 1. Objetivo

Dejar definido cómo ejecutar el backend fuera del entorno de desarrollo sin
confundir el servidor de desarrollo con un proceso de producción. Este módulo
prepara el contrato operativo, pero no agrega una plataforma concreta como
Docker, Kubernetes o un proveedor cloud que todavía no fue elegido.

## 2. Punto de entrada ASGI

La aplicación que debe cargar el servidor es:

```text
app.api.app:app
```

`app.api.app` expone la instancia FastAPI y su `lifespan`. Durante el startup:

1. configura el logging de la aplicación;
2. valida la configuración cuando `APP_ENV=production`;
3. construye el `Container` de dependencias;
4. deja disponible el proceso para recibir requests.

Si la configuración de producción es insegura o incompleta, el startup falla.
Esto evita levantar una instancia que parezca disponible pero no pueda operar.

## 3. Instalación del artefacto

Desde `backend`, en una máquina o imagen limpia:

```powershell
python --version
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

En Linux/macOS, el equivalente para activar el entorno es:

```bash
source .venv/bin/activate
```

Las dependencias están fijadas en `requirements.txt`. La instalación debe
ejecutarse durante el build o provisioning, nunca como parte de cada request.

## 4. Configuración de producción

Definir las variables mediante el mecanismo de secretos/configuración del
entorno de destino. No subir un `.env` real al repositorio.

Variables obligatorias para `APP_ENV=production`:

```text
APP_ENV=production
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
MYSQL_HOST=<host-real-de-mysql>
MYSQL_PORT=<puerto-real>
MYSQL_USER=<usuario>
MYSQL_PASSWORD=<secreto>
MYSQL_DATABASE=<base-de-datos>
JWT_SECRET_KEY=<secreto-aleatorio-de-al-menos-32-caracteres>
CORS_ALLOWED_ORIGINS=https://<frontend-real>
```

Además deben revisarse según el entorno:

```text
REQUEST_TIMEOUT
LOG_LEVEL
MYSQL_POOL_SIZE
JWT_ALGORITHM
JWT_ACCESS_TOKEN_MINUTES
RATE_LIMIT_LOGIN_MAX_REQUESTS
RATE_LIMIT_LOGIN_WINDOW_SECONDS
```

La configuración de producción rechaza valores de desarrollo como `localhost`,
`127.0.0.1` o `*` en CORS. La clave JWT de ejemplo tampoco es válida para
producción.

## 5. Comando de ejecución

### Desarrollo local

```powershell
python -m uvicorn app.api.app:app --reload --host 127.0.0.1 --port 8000
```

### Producción o staging

```powershell
python -m uvicorn app.api.app:app --host 0.0.0.0 --port 8000 --workers 1
```

En Linux/macOS se utiliza el mismo comando. En producción no debe utilizarse
`--reload`: ese modo está pensado para desarrollo y reinicia el proceso cuando
cambia un archivo.

Se deja `--workers 1` como decisión consciente del estado actual. El rate
limiter del login y las métricas son locales al proceso; varios workers tendrían
contadores y límites independientes. Para escalar horizontalmente primero hay
que mover ese estado a un componente compartido o aceptar/documentar el cambio
de comportamiento.

El puerto externo puede ser publicado directamente o detrás de un reverse
proxy. TLS, dominio, límites de red y terminación de conexiones pertenecen a
esa infraestructura y no se deben simular dentro de FastAPI.

## 6. Health checks

Los endpoints operativos son:

| Endpoint | Uso | Dependencia de MySQL | Estado no saludable |
| --- | --- | --- | --- |
| `GET /health/live` | El proceso responde HTTP | No | No responde o proceso caído |
| `GET /health/ready` | El proceso puede atender tráfico | Sí, ejecuta `SELECT 1` | `503 Service Unavailable` |

Ejemplos de smoke test:

```powershell
Invoke-WebRequest http://127.0.0.1:8000/health/live
Invoke-WebRequest http://127.0.0.1:8000/health/ready
```

Un orquestador debe usar liveness para decidir si reinicia el proceso y
readiness para decidir si le envía tráfico. No debe utilizar `/` como sustituto
de readiness porque la ruta raíz no comprueba la base de datos.

## 7. Secuencia recomendada de release

```text
Instalar dependencias
        ↓
Configurar secretos y variables
        ↓
Verificar schema MySQL existente
        ↓
Iniciar app.api.app:app
        ↓
Comprobar /health/live
        ↓
Comprobar /health/ready
        ↓
Ejecutar smoke test autenticado
        ↓
Habilitar tráfico del frontend
```

El schema no se crea automáticamente: el repositorio todavía no contiene
migraciones versionadas ni un pipeline de DDL. El provisioning de las tablas
`users`, `coins`, `favorites` y `price_history` debe resolverse antes del
startup operativo.

## 8. Logging y observabilidad

- La aplicación emite logs JSON por stdout/stderr.
- Cada request incluye `X-Request-ID` en la respuesta y en los logs de runtime.
- La latencia y los estados HTTP se registran por proceso.
- Los logs deben ser recolectados por la plataforma de deployment, no guardados
  en archivos dentro del contenedor o servidor efímero.
- No se deben registrar contraseñas, hashes, tokens JWT ni secretos.

Con múltiples procesos, los logs siguen siendo válidos, pero las métricas
internas y el rate limiter no representan un estado global.

## 9. Checklist de seguridad

- [x] El entrypoint ASGI está definido.
- [x] `--reload` está separado del comando productivo.
- [x] La configuración productiva falla ante secretos o CORS inseguros.
- [x] El health check de readiness comprueba MySQL sin exponer credenciales.
- [x] La plantilla no contiene secretos reales.
- [ ] Elegir proveedor o plataforma de deployment.
- [ ] Configurar TLS y reverse proxy.
- [ ] Automatizar migraciones o provisioning del schema.
- [ ] Externalizar rate limiting y métricas antes de usar múltiples workers.
- [ ] Agregar pipeline CI/CD y rollback.

## 10. Verificación realizada

Se verificó el contrato con:

```powershell
python -m pytest -q
python -m unittest discover -s app/tests -p "*_test.py"
```

Resultado del estado actual:

```text
pytest: 163 passed, 1 warning
unittest: 24 tests OK
```

La advertencia corresponde a compatibilidad entre `TestClient` de Starlette y
la versión instalada de `httpx`; no bloquea el runtime de producción.

## 11. Estado final

M86 deja preparada la ejecución productiva del backend y documenta sus límites
actuales. La siguiente etapa vuelve al flujo de integración con el frontend,
utilizando el contrato HTTP y los health checks ya definidos.
