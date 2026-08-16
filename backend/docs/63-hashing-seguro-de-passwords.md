# Módulo 63 — Hashing seguro de passwords

## Objetivo

Consolidar el hashing usado por el registro: salt aleatorio, derivación costosa con `scrypt`, verificación segura y rechazo de hashes inválidos.

## Decisión técnica

Se usa `hashlib.scrypt` de la biblioteca estándar de Python. `scrypt` deriva una clave a partir de password + salt y está diseñado para ser costoso frente a ataques de fuerza bruta.

El valor almacenado contiene algoritmo, parámetros, salt y clave derivada:

```text
scrypt$16384$8$1$<salt-base64>$<hash-base64>
```

Nunca se guarda el password original.

## Salt y verificación

Cada llamada a `hash()` genera 16 bytes aleatorios. Por eso dos hashes del mismo password son distintos y ambos válidos.

`verify()` reconstruye la clave con los parámetros almacenados y usa `hmac.compare_digest`, que evita comparaciones tempranas observables. Un formato malformado o algoritmo desconocido devuelve `False`, sin filtrar detalles internos.

## Archivos modificados

- `app/security/password_hasher.py`
- `app/tests/unit/test_password_hasher.py`

## Tests ejecutados

```powershell
python -m pytest app/tests/unit/test_password_hasher.py
python -m pytest
```

- Hashing: 3 aprobados.
- Suite Pytest: 118 aprobados.

## Estado final

El registro persiste hashes con salt y el proyecto puede verificar credenciales sin recuperar passwords. No hay rutas nuevas en este módulo; la siguiente etapa usa `verify()` para implementar login.

## Siguiente módulo

Módulo 64 — Login y verificación de credenciales.
