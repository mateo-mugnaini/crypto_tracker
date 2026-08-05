# Módulo 13 - Diseño de la Base de Datos

## ¿Qué es una base de datos?

Una base de datos es un sistema que permite almacenar información de forma permanente.

A diferencia de las variables de un programa, los datos permanecen disponibles incluso después de cerrar la aplicación.

---

## ¿Por qué utilizaremos MySQL?

Elegimos MySQL porque:

- Es una base de datos relacional ampliamente utilizada.
- Tiene una gran comunidad y documentación.
- Es gratuita.
- Se integra muy bien con Python.
- Facilita el aprendizaje de otros motores relacionales como PostgreSQL.

---

## ¿Qué significa que una base de datos sea relacional?

Una base de datos relacional organiza la información en tablas.

Cada tabla representa una entidad del sistema y puede relacionarse con otras mediante claves.

Esto evita duplicar información y mantiene los datos organizados.

---

## Entidades de Crypto Tracker

Para la primera versión del proyecto identificamos cuatro entidades principales:

- Users
- Coins
- Favorites
- PriceHistory

Cada una representa un concepto diferente dentro del dominio de la aplicación.

---

## Diseño de las tablas

### users

Almacena la información de los usuarios registrados.

Campos:

- id
- username
- email
- password
- created_at

La contraseña nunca se almacena en texto plano; siempre se guardará su hash.

---

### coins

Representa las criptomonedas conocidas por el sistema.

Campos:

- id
- symbol
- name
- market_cap_rank

No almacena el precio porque este cambia constantemente.

---

### price_history

Guarda el historial de precios de cada criptomoneda.

Campos:

- id
- coin_id
- price
- recorded_at

Gracias a esta tabla podremos consultar la evolución del precio a lo largo del tiempo y generar gráficos en el futuro.

---

### favorites

Relaciona usuarios con criptomonedas favoritas.

Campos:

- id
- user_id
- coin_id

Esta tabla representa una relación entre dos entidades.

---

## Relaciones

El modelo actual contiene las siguientes relaciones:

- Un usuario puede tener muchos favoritos.
- Una criptomoneda puede aparecer en los favoritos de muchos usuarios.
- Una criptomoneda puede tener muchos registros de precios históricos.

---

## ¿Qué es la normalización?

La normalización consiste en dividir la información en varias tablas para evitar duplicaciones y mantener la consistencia de los datos.

Por ejemplo, el precio de una criptomoneda no se almacena en la tabla `coins`, sino en `price_history`, permitiendo conservar un historial completo de cambios.

---

## Beneficios de diseñar la base de datos antes de implementarla

Diseñar las tablas previamente permite:

- Detectar errores de modelado antes de escribir código.
- Evitar duplicación de información.
- Comprender las relaciones entre entidades.
- Facilitar el mantenimiento y la escalabilidad del proyecto.

Una buena base de datos comienza con un buen diseño, no con la escritura inmediata de sentencias SQL.
