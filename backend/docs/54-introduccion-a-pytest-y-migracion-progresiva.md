# Módulo 54 — Introducción a Pytest y migración progresiva

## Objetivo

Incorporar Pytest al proyecto sin eliminar de golpe los tests existentes en `unittest`. La migración comienza con un archivo representativo de reglas de dominio y mantiene ambas herramientas operativas.

## Problema que resolvemos

La base de tests tenía dos limitaciones prácticas:

- `unittest` requiere clases, métodos `test_*` y aserciones como `self.assertEqual`.
- Muchos archivos del proyecto usan nombres históricos como `*_test.py`; el patrón por defecto de Pytest solo descubre `test_*.py`.

Pytest permite tests más compactos, fixtures reutilizables y una sintaxis natural para comprobar excepciones. No obstante, convertir todos los tests a la vez añadiría riesgo y no aporta valor inmediato.

## Conceptos aprendidos

### Pytest

Pytest es un framework de testing que descubre funciones llamadas `test_*` y usa la sentencia nativa `assert` de Python.

```python
def test_sum():
    assert 2 + 2 == 4
```

No reemplaza automáticamente a `unittest`: Pytest también puede ejecutar tests escritos con `unittest.TestCase`. Esto permite una migración gradual.

### Fixtures

Una fixture prepara un recurso para un test y Pytest la entrega por nombre de parámetro.

```python
@pytest.fixture
def favorite_service():
    return FavoriteService(...)


def test_example(favorite_service):
    ...
```

En este módulo las fixtures construyen mocks y un `FavoriteService` aislado. Más adelante podrán centralizarse en archivos `conftest.py` cuando haya necesidades compartidas reales.

### `pytest.raises`

Para comprobar excepciones usamos:

```python
with pytest.raises(UserNotFoundException):
    favorite_service.add_favorite(favorite)
```

Es el equivalente expresivo a `self.assertRaises(...)` de `unittest`.

## Decisión de migración

Se migró solamente `domain_exception_test.py` a `test_domain_exceptions.py`.

Este archivo es una buena primera migración porque es un test unitario aislado: usa mocks, no necesita FastAPI, MySQL ni red, y ejercita las excepciones introducidas en M52.

Los demás tests continúan en `unittest` o como funciones históricas. No se cambiaron por conveniencia; se migrarán cuando un módulo futuro los necesite.

## Configuración de discovery

Se creó `pytest.ini`:

```ini
[pytest]
testpaths = app/tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts = -ra
```

La segunda regla de `python_files` preserva la convención ya existente `*_test.py`. De este modo Pytest descubre la colección histórica sin obligar a renombrarla ahora.

## Archivos creados

- `pytest.ini`
- `app/tests/test_domain_exceptions.py`

## Archivos modificados

- `requirements.txt`: se añadió `pytest>=8.0,<10.0`.

## Archivos retirados

- `app/tests/domain_exception_test.py`: su cobertura fue migrada a `test_domain_exceptions.py`.

## Comandos de ejecución

Desde `backend` y con `.venv` activo:

```powershell
python -m pytest app/tests/test_domain_exceptions.py
python -m pytest
python -m unittest discover -s app/tests -p "*_test.py"
```

## Tests ejecutados y resultados

- `python -m pytest app/tests/test_domain_exceptions.py`: 5 tests aprobados.
- `python -m pytest`: 78 tests aprobados.
- `python -m unittest discover -s app/tests -p "*_test.py"`: 24 tests aprobados.

Pytest descubre más pruebas que la ejecución actual de `unittest` porque puede ejecutar tanto funciones `test_*` como clases `unittest.TestCase`, además de respetar los patrones configurados. Este aumento es de discovery, no implica que se hayan creado 78 tests nuevos en este módulo.

Se mantiene una advertencia externa de deprecación entre Starlette `TestClient` y `httpx`; no afectó los resultados.

## Alternativas y trade-offs

- Convertir todos los tests ahora: homogeneizaría la base, pero ocultaría regresiones y ampliaría demasiado el alcance.
- Mantener solo `unittest`: evita una dependencia, pero pierde fixtures y una sintaxis más simple para los siguientes módulos.
- Usar Pytest como runner de tests `unittest`: es la opción elegida durante la transición; conserva cobertura y permite migrar archivo por archivo.

## Estado final

Pytest está instalado, configurado y verificado. El proyecto puede ejecutar ambas suites mientras avanza la migración progresiva.

## Siguiente módulo

Módulo 55 — Unit Testing de Services y lógica de negocio.
