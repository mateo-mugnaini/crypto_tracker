# Módulo 18 - Diseño completo de la Base de Datos

## Objetivo

En este módulo diseñamos la estructura completa de la base de datos de Crypto Tracker antes de implementar nuevas funcionalidades.

Diseñar primero la base de datos permite detectar problemas de modelado y facilita el desarrollo del backend.

---

# Entidades principales

La aplicación estará compuesta inicialmente por cuatro entidades:

- Users
- Coins
- Favorites
- Price History

Cada una representa un concepto diferente del dominio de la aplicación.

---

# Users

Almacena la información de los usuarios registrados.

Campos principales:

- id
- username
- email
- password_hash
- created_at

La contraseña nunca debe almacenarse en texto plano. Siempre debe guardarse un hash generado mediante un algoritmo seguro.

---

# Coins

Representa las criptomonedas disponibles en el sistema.

Campos:

- id
- symbol
- name
- market_cap_rank

Esta tabla contiene información relativamente estable de cada moneda.

---

# Favorites

Relaciona usuarios con criptomonedas.

Un usuario puede tener muchas monedas favoritas y una moneda puede pertenecer a muchos usuarios.

Este tipo de relación se conoce como **muchos a muchos (Many-to-Many)** y normalmente se implementa mediante una tabla intermedia.

---

# Price History

Almacena el historial de precios de cada moneda.

Cada registro representa el precio de una criptomoneda en un momento determinado.

Esto permite realizar consultas históricas, gráficos y análisis sin perder información.

---

# ¿Por qué separar el historial?

Si el precio se almacenara directamente en la tabla `coins`, cada actualización sobrescribiría el valor anterior.

Separar el historial permite conservar todos los cambios realizados a lo largo del tiempo.

---

# Tipos de datos

Se utiliza `DECIMAL` para almacenar precios debido a que ofrece mayor precisión que `FLOAT` y evita errores de redondeo comunes en aplicaciones financieras.

---

# Relaciones

El modelo lógico queda así:

```text
Users
   │
   │ 1
   │
   │ N
Favorites
   │
   │ N
   │
   │ 1
Coins
   │
   │ 1
   │
   │ N
PriceHistory
```

Este diseño facilita la escalabilidad del proyecto y evita duplicación innecesaria de datos.

---

# Buenas prácticas aprendidas

- Diseñar la base de datos antes de implementar funcionalidades.
- Separar entidades según su responsabilidad.
- Utilizar tablas intermedias para relaciones muchos a muchos.
- Mantener el historial de información que cambia con frecuencia.
- Elegir tipos de datos adecuados para información financiera.
