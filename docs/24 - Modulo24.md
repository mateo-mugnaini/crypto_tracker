# Módulo 24 - Services (Lógica de negocio)

### ¿Qué hace un Service?

El Service coordina el trabajo.

Ejemplo:

```shell
Usuario solicita actualizar monedas
↓
CoinService
↓
CoinGeckoClient
↓
Obtiene monedas
↓
CoinRepository
↓
Las guarda
```

Observa que el Service no `ejecuta SQL` y no hace peticiones `HTTP directamente`, utiliza otras clases para hacerlo.

### Responsabilidades de cada capa.

```py
# Main -> Se encarga de iniciar el programa y recibir acciones del usuario

service.update_coins()

# Service -> Contiene las reglas de negocio:
# Ejemplo:
# - Actualizar monedas.
# - Sincronizar datos.
# - Validar información.
# - Decir qué hacer con los datos.

# Repository -> Solo sabe guardar y leer datos

# Ejemplo:
save()
find_all()
find_by_id()

# Database -> Se encarga de la conexión con MySQL
```
