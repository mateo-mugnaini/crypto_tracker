# Módulo 23 - Consultas de Coin, Favorites y Price History

> ## Objetivo
>
> Completar la comunicación: <br/>
> Python <br/>
> ↓<br/>
> Repository<br/>
> ↓<br/>
> MySQL
>
> para todas nuestras entidades.
>
> Al finalizar tendremos:
>
> ---
>
> ### CoinRepository
>
> - save()
> - find_all()
> - find_by_id()
>
> ---
>
> ### FavoriteRepository
>
> - save()
> - find_all_by_user()
>
> ---
>
> ### PriceHistoryRepository
>
> - save()
> - find_by_coin()

## 1. CoinRepository

[VER ARCHIVO](../backend/app/repositories/coin_repository.py)

Actualmente tenemos: `save()`

Vamos a agregar:

- find_all()
- find_by_id()

## 2. FavoriteRepository

[VER ARCHIVO](../backend/app/repositories/favorite_repository.py)

Actualmente tenemos: `save()`

Vamos a agregar:

- find_all_by_user()

> Dame todas las monedas favoritas de este usuario.

Consulta:

```sql
SELECT \*
FROM favorites
WHERE user_id = 1;
```

## 3. PriceHistoryRepository

[VER ARCHIVO](../backend/app/repositories/price_history_repository.py)
