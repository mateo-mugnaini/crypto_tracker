# Módulo 55 — Unit Testing de Services y lógica de negocio

## Objetivo

Probar las reglas de negocio de `FavoriteService` y `CoinService` de forma aislada. Los tests no usan MySQL, CoinGecko ni FastAPI: sustituyen esas dependencias por mocks.

## Qué es un unit test

Un unit test verifica una unidad pequeña de comportamiento, normalmente un método, aislándola de recursos externos.

Para un service, la unidad no es solo el valor que devuelve. También incluye las decisiones de negocio que toma y cómo colabora con sus dependencias:

```text
FavoriteService
    ├── valida usuario
    ├── valida moneda
    ├── valida favorito existente
    └── ordena guardar al repository
```

Un test unitario no verifica que MySQL guarde correctamente. Eso corresponde a un test de integración posterior. Aquí verificamos que el service solicite el guardado únicamente después de superar las reglas.

## Qué problema resolvemos

Los tests históricos de `FavoriteService` eran un script manual y no se descubrían automáticamente. `CoinService` tenía dos casos con fakes, pero no cubría la diferencia entre guardar y actualizar, la sincronización ni la protección frente a persistencia después de un error externo.

Ahora las reglas centrales tienen tests Pytest explícitos, rápidos y aislados.

## Herramientas aplicadas

### Mocks

`Mock()` simula un repository o cliente HTTP. Permite controlar su respuesta y preguntar posteriormente cómo se utilizó.

```python
repository.exists.return_value = False
service.update_coin("bitcoin")
repository.save.assert_called_once_with(coin)
```

No imitamos la base de datos; solo definimos el comportamiento necesario para el escenario.

### Assertions de interacción

Además de `assert result == ...`, verificamos que una dependencia recibió —o no recibió— una llamada:

```python
favorite_repository.save.assert_not_called()
```

Esto evita falsos positivos. Si el usuario no existe, no basta con comprobar que se lanzó `UserNotFoundException`; también debe cumplirse que no se consulte ni guarde un favorito después de esa condición.

### `pytest.raises`

Las excepciones de dominio y las de CoinGecko se comprueban con `pytest.raises`, sin depender del texto de un error HTTP:

```python
with pytest.raises(FavoriteAlreadyExistsException):
    service.add_favorite(favorite)
```

## Casos cubiertos

### `FavoriteService`

| Regla | Resultado verificado |
|---|---|
| Usuario, moneda y relación válidos | Guarda el favorito y devuelve éxito. |
| Usuario inexistente | Lanza `UserNotFoundException`; no consulta moneda ni guarda. |
| Moneda inexistente | Lanza `CoinNotFoundException`; no consulta ni guarda favorito. |
| Favorito duplicado | Lanza `FavoriteAlreadyExistsException`; no guarda. |
| Favorito existente al eliminar | Elimina y devuelve éxito. |
| Favorito ausente al eliminar | Lanza `FavoriteNotFoundException`; no elimina. |
| Consultar favoritos | Valida usuario y delega al repository. |

### `CoinService`

| Regla | Resultado verificado |
|---|---|
| Moneda nueva | Mapea y llama a `save`. |
| Moneda existente | Mapea y llama a `update`. |
| API sin datos al actualizar | Lanza `CoinGeckoException`; no persiste. |
| Sincronización mixta | Guarda monedas nuevas y actualiza existentes. |
| API sin datos al sincronizar | Lanza `CoinGeckoException`; no consulta persistencia. |
| Consultas de monedas | Delega al repository. |

## Archivos creados

- `app/tests/test_favorite_service.py`
- `app/tests/test_coin_service.py`

## Archivos de producción modificados

Ninguno. El módulo valida el comportamiento actual; no altera reglas de negocio para hacer que los tests pasen.

## Cómo ejecutar

Desde `backend`, con `.venv` activo:

```powershell
python -m pytest app/tests/test_favorite_service.py app/tests/test_coin_service.py
python -m pytest
python -m unittest discover -s app/tests -p "*_test.py"
```

## Tests ejecutados y resultados

- Unit tests nuevos de services: 14 aprobados.
- Suite completa de Pytest: 92 aprobados.
- Suite histórica de `unittest`: 24 aprobados.

Se mantiene una advertencia externa de deprecación entre Starlette `TestClient` y `httpx`; no afectó los resultados.

## Decisiones y trade-offs

- Usamos mocks para aislar services. Son rápidos y deterministas, pero no prueban SQL ni red real.
- Conservamos los tests de Price History existentes. Ya prueban la lógica del service con un repository mockeado; su migración de estilo puede continuar más adelante sin duplicar cobertura ahora.
- No usamos `MagicMock`: `Mock` cubre las llamadas de métodos normales que necesita este módulo. `MagicMock` se estudiará en el módulo de mocking.

## Estado final

Las decisiones principales de `FavoriteService` y `CoinService` están cubiertas por tests unitarios Pytest aislados. La siguiente capa de aprendizaje será profundizar en los distintos tipos de mocks y el control fino de sus comportamientos.

## Siguiente módulo

Módulo 56 — Mocking con `Mock`, `MagicMock` y `patch`.
