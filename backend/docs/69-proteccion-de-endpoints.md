# Módulo 69 — Protección de endpoints

## Política actual

| Recurso | Acceso |
|---|---|
| Coins y Price History | Público: son datos de mercado. |
| Registro y login | Público: son la entrada a autenticación. |
| `/users/me` | JWT Bearer requerido. |
| Favorites | JWT Bearer requerido y ownership obligatorio. |

No se introducen roles admin todavía porque no existe un modelo de permisos que los justifique.

## Verificación

Los cuatro endpoints de favoritos se probaron sin header Authorization y todos devuelven HTTP 401.

## Siguiente

M70 — validación de entradas y SQL Injection.
