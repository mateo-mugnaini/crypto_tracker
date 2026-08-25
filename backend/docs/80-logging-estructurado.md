# Módulo 80 — Logging estructurado

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Observabilidad / Runtime / API  
> **Módulo anterior:** 79 — Datasets grandes y rendimiento  
> **Siguiente módulo:** 81 — Configuración por entornos

## 1. Problema detectado

El cliente de CoinGecko y el comando puntual utilizaban `print()`. Ese formato dificulta:

- filtrar eventos por nivel;
- buscar errores por endpoint;
- enviar logs a un agregador;
- distinguir timeout, conexión y error HTTP;
- medir duración de requests;
- evitar que datos sensibles terminen accidentalmente en consola.

## 2. Solución

Se agregó `app/logging_config.py` con un formatter JSON basado únicamente en la librería estándar de Python.

Ejemplo de evento:

```json
{
  "timestamp": "2026-08-25T12:00:00+00:00",
  "level": "INFO",
  "logger": "crypto_tracker.api",
  "message": "HTTP request completed.",
  "event": "http_request_completed",
  "method": "GET",
  "path": "/coins",
  "status_code": 200,
  "duration_ms": 4.21
}
```

El timestamp se expresa en UTC y los campos estructurados se mantienen acotados a un conjunto explícito.

## 3. Eventos implementados

### Requests HTTP

El middleware de FastAPI registra:

```text
http_request_completed
http_request_failed
```

Incluye:

- método;
- path sin query string;
- status HTTP cuando existe respuesta;
- duración en milisegundos;
- tipo de error en fallos no controlados.

No incluye body, headers, cookies, Authorization ni query params.

### CoinGecko

El cliente registra:

```text
coingecko_base_url_missing
coingecko_timeout
coingecko_connection_error
coingecko_http_error
coingecko_request_error
```

Los errores HTTP incluyen el status si existe, pero no el cuerpo de la respuesta ni la URL completa. Las excepciones de `requests` no se interpolan en el mensaje para evitar filtrar detalles de transporte.

### CLI

`python -m app.main` y `mostrar_titulo()` registran:

```text
coin_sync_completed
```

El comando ya no imprime la representación completa de la moneda.

## 4. Configuración

La variable disponible es:

```env
LOG_LEVEL=INFO
```

La configuración se aplica al logger raíz de la aplicación `crypto_tracker`, no al root logger global. Esto evita modificar silenciosamente el comportamiento de librerías externas.

El handler se agrega una sola vez por proceso y el formatter no se duplica si `configure_logging()` se invoca más de una vez.

## 5. Dónde se configura

La configuración se ejecuta:

- durante el `lifespan` de FastAPI;
- al iniciar `python -m app.main`.

No se inicializa un handler al importar el módulo. Esto mantiene los imports y los tests unitarios sin efectos secundarios de salida.

## 6. Seguridad

Nunca deben registrarse:

- passwords;
- `password_hash`;
- JWT completos;
- `Authorization`;
- cookies o headers de sesión;
- bodies con credenciales;
- secretos de `.env`;
- respuestas completas de proveedores externos.

El middleware usa solo metadata de transporte. Los mensajes de CoinGecko usan tipos de error y paths controlados, no el texto completo de la excepción.

El path puede contener identificadores públicos como `bitcoin`; eso no debe interpretarse como una autorización para registrar datos sensibles en paths futuros.

## 7. Tests

`app/tests/unit/test_logging.py` verifica:

- serialización JSON;
- inclusión de campos permitidos;
- exclusión de un campo sensible simulado;
- evento estructurado para timeout de CoinGecko.

Los tests existentes de API continúan comprobando que los errores HTTP mantienen sus status y envelopes; el logging no cambia esos contratos.

## 8. Logging y errores HTTP

Logging no reemplaza los handlers de excepciones. El flujo correcto sigue siendo:

```text
Excepción
   ├── logging para diagnóstico interno
   └── handler para respuesta HTTP segura
```

El cliente de CoinGecko registra el fallo y devuelve `None`, manteniendo el comportamiento actual que el service convierte en `CoinGeckoException` y la API en `502`.

## 9. Limitaciones

- No existe todavía correlation ID por request.
- No hay exportación a OpenTelemetry, Sentry o ELK.
- Los logs se escriben en stdout/stderr mediante `StreamHandler`.
- No se implementó rotación de archivos; esa responsabilidad corresponde al entorno de despliegue.
- Los logs de tests y scripts históricos que tienen `print()` no forman parte del runtime principal.
- El nivel es global para `crypto_tracker`; todavía no existe configuración por logger.

## 10. Comandos

Iniciar el servidor:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
```

Probar logging:

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/unit/test_logging.py -q
```

Suite completa:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

## 11. Checklist

- [x] `print()` de CoinGecko reemplazado.
- [x] `print()` del comando principal reemplazado.
- [x] Formatter JSON agregado.
- [x] Eventos HTTP de finalización y fallo agregados.
- [x] Duración HTTP medida.
- [x] Datos sensibles excluidos del formatter.
- [x] `LOG_LEVEL` documentado.
- [x] Tests unitarios agregados.
- [x] Contratos HTTP existentes preservados.

## 12. Estado final

M80 queda implementado y verificado. El backend dispone de logs JSON básicos, seguros y filtrables para requests HTTP, errores de CoinGecko y sincronización puntual. El siguiente paso es separar configuración por entorno antes de agregar observabilidad más avanzada.
