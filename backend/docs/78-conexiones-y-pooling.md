# Módulo 78 — Conexiones MySQL y pooling

> **Estado:** IMPLEMENTADO Y VERIFICADO  
> **Proyecto:** Crypto Tracker  
> **Capa:** Database / Infraestructura  
> **Módulo anterior:** 77 — Decisión sobre caching  
> **Siguiente módulo:** 79 — Datasets grandes y rendimiento

## 1. Problema detectado

Antes de este módulo, cada llamada a `get_connection()` creaba una conexión nueva mediante `mysql.connector.connect()`.

Los repositories abrían y cerraban conexiones correctamente, pero abrir una conexión TCP/MySQL tiene un coste mayor que reutilizar una conexión disponible. Con muchas requests concurrentes, el patrón podía producir:

- más handshakes contra MySQL;
- más latencia por request;
- más conexiones simultáneas de las necesarias;
- mayor presión sobre el límite de conexiones del servidor.

## 2. Solución elegida

`get_connection()` utiliza ahora `mysql.connector.pooling.MySQLConnectionPool` de forma lazy:

```text
Primera llamada a get_connection()
        │
        ▼
Crear pool de aplicación
        │
        ▼
Obtener una conexión del pool

Siguientes llamadas
        │
        ▼
Reutilizar el pool y obtener otra conexión disponible
```

El pool tiene un tamaño configurable mediante `MYSQL_POOL_SIZE`, con valor predeterminado `10` para el desarrollo local. Si todas las conexiones están ocupadas, `get_connection()` espera hasta `MYSQL_POOL_ACQUIRE_TIMEOUT_SECONDS` (por defecto, `2` segundos) antes de propagar el error.

## 3. Por qué la creación es lazy

El pool no se crea al importar `app.database.connection`. Se crea en la primera llamada real a `get_connection()`.

Esto permite:

- importar la aplicación sin conectar a MySQL;
- ejecutar tests unitarios sin credenciales reales;
- retrasar errores de conexión hasta el momento de uso;
- evitar crear conexiones si el proceso solo necesita generar OpenAPI o ejecutar lógica aislada.

La inicialización está protegida con `Lock` para que dos requests concurrentes no creen dos pools durante la primera inicialización.

## 4. Cierre correcto de una conexión pooled

Los repositories existentes continúan usando:

```python
connection = get_connection()
try:
    # cursor y query
finally:
    cursor.close()
    connection.close()
```

En una conexión entregada por `MySQLConnectionPool`, `connection.close()` devuelve la conexión al pool; no implica necesariamente destruir la conexión física. Por eso no fue necesario reescribir todos los repositories.

Cerrar el cursor sigue siendo obligatorio para liberar recursos del lado del driver.

## 5. Separación entre aplicación e integración

La función `get_connection()` usa el pool de la base normal de la aplicación.

La función `get_test_connection()` mantiene una conexión directa a `MYSQL_TEST_DATABASE` porque los tests de integración necesitan:

- controlar explícitamente cada conexión;
- aislar limpieza y transacciones;
- evitar que un pool global conserve estado entre tests;
- no mezclar credenciales o bases de aplicación y testing.

No se usa el pool de aplicación para modificar la base de pruebas.

## 6. Configuración

En `.env.example`:

```env
MYSQL_POOL_SIZE=10
MYSQL_POOL_ACQUIRE_TIMEOUT_SECONDS=2
```

La configuración rechaza valores menores que `1` para evitar inicializar un pool inválido.

El tamaño no debe elegirse arbitrariamente. Debe considerar:

```text
número de workers
concurrencia esperada
max_connections de MySQL
conexiones usadas por otros procesos
```

Por ejemplo, cuatro workers con un pool de cinco podrían llegar a reservar hasta veinte conexiones de aplicación, además de las conexiones administrativas y de testing.

## 7. Archivos modificados

### `app/database/connection.py`

- agrega el pool global por proceso;
- crea el pool de forma lazy;
- usa un `Lock` durante la inicialización;
- conserva `get_test_connection()` directo.

### `app/config/settings.py`

- agrega `mysql_pool_size`;
- valida que sea mayor que cero.

### `.env.example` y `README.md`

- documentan `MYSQL_POOL_SIZE` y su valor predeterminado.

### `app/tests/database_test.py`

Comprueba que:

- el pool se crea con la configuración esperada;
- la conexión se obtiene mediante `get_connection()` del pool;
- dos llamadas reutilizan la misma instancia de pool;
- la creación sigue siendo lazy.

## 8. Alternativas consideradas

### Crear una conexión por request

Es el comportamiento anterior. Es simple, pero repite el coste de conexión y no controla bien la concurrencia.

### Crear el pool al importar el módulo

Reduce el trabajo de la primera request, pero introduce efectos secundarios durante imports y rompe con facilidad tests o comandos que no necesitan MySQL.

### Pool externo o Redis

No corresponde: Redis puede almacenar datos, pero no administra conexiones MySQL. Un proxy externo como ProxySQL sería una decisión de infraestructura posterior.

### SQLAlchemy/SQLModel

Podrían aportar engine, pooling y manejo de sesiones, pero introducirían una nueva capa tecnológica en un proyecto que usa directamente `mysql-connector-python`. No es necesario para resolver este problema puntual.

## 9. Limitaciones

- El pool vive por proceso; varios workers crean pools independientes.
- El tamaño total debe calcularse multiplicando pool por worker.
- La adquisición incluye un retry corto y acotado cuando todas las conexiones están ocupadas; no sustituye un dimensionamiento correcto del pool.
- No se cambió todavía la arquitectura de transacciones.
- El pool no corrige fugas de cursores o conexiones si un repository no ejecuta su `finally` correctamente.
- Una conexión caída puede requerir manejo adicional según la configuración y versión del driver.

El siguiente módulo, M79, deberá estudiar comportamiento con datasets grandes y concurrencia antes de ajustar el tamaño del pool.

## 10. Seguridad

- Las credenciales continúan llegando desde variables de entorno.
- No se registran passwords ni cadenas de conexión.
- La base de testing permanece separada.
- El pool no cambia la parametrización de queries.
- Los valores de configuración no se interpolan dentro de SQL.

## 11. Tests y comandos

Test de conexión:

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/database_test.py -q
```

Suite completa:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

## 12. Checklist

- [x] Pool de aplicación agregado.
- [x] Creación lazy implementada.
- [x] Inicialización protegida contra concurrencia.
- [x] Tamaño configurable mediante `MYSQL_POOL_SIZE`.
- [x] Valor inválido rechazado.
- [x] Conexiones de integración mantenidas separadas.
- [x] Repositories existentes conservan su cierre de conexiones.
- [x] Test de creación y reutilización agregado.
- [x] Documentación actualizada.
- [x] No se modificó la base principal.

## 13. Estado final

M78 queda implementado y documentado. La aplicación reutiliza conexiones MySQL por proceso sin crear el pool al importar módulos, y los tests de integración siguen aislados de la infraestructura de pooling de producción.
