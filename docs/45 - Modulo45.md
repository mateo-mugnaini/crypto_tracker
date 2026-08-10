Módulo 45 — Estadísticas de Price History

1. Objetivo
   Implementar estadísticas agregadas del historial:
   COUNT
   MIN
   MAX
   AVG
   Nuevo endpoint:
   GET /coins/{coin_id}/price-history/statistics
   Ejemplo:
   {
   "coin_id": "bitcoin",
   "count": 3,
   "min_price": 64000.0,
   "max_price": 65000.0,
   "average_price": 64500.0
   }
   Si no existen registros:
   {
   "coin_id": "dogecoin",
   "count": 0,
   "min_price": null,
   "max_price": null,
   "average_price": null
   }
   No se implementan todavía variaciones de precio ni GROUP BY, porque corresponden a M46 y M47.
2. Problema que resolvemos
   No queremos recuperar todos los registros para calcular estadísticas en Python:
   MySQL → millones de registros → Python → cálculo
   Usamos agregaciones SQL:
   MySQL → una fila agregada → Service → API
   Esto reduce tráfico, memoria y tiempo de procesamiento.
3. Arquitectura
   FastAPI
   ↓
   Controller
   ↓
   Service
   ↓
   Repository
   ↓
   MySQL
   Repository: ejecuta COUNT, MIN, MAX y AVG.
   Service: valida y transforma los resultados.
   Controller: delega.
   API: expone el endpoint.
   No se crea un nuevo modelo de dominio porque las estadísticas son una proyección calculada, no una entidad persistente.
4. SQL
   SELECT
   COUNT(\*) AS count,
   MIN(price) AS min_price,
   MAX(price) AS max_price,
   AVG(price) AS average_price
   FROM price_history
   WHERE coin_id = %s;
   El parámetro se pasa correctamente:
   (coin_id,)
   La coma es necesaria para crear una tupla de un solo elemento.
5. Archivos modificados
   [price_history_repository.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/repositories/price_history_repository.py)
   [price_history_service.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/services/price_history_service.py)
   [price_history_controller.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/controllers/price_history_controller.py)
   [app.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/api/app.py)
   Archivos nuevos:
   [price_history_statistics_service_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_statistics_service_test.py)
   [price_history_statistics_controller_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_statistics_controller_test.py)
   [price_history_statistics_repository_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_statistics_repository_test.py)
   [45-estadisticas-price-history.md](/C:/Users/mateo/Projects/crypto_tracker/backend/docs/45-estadisticas-price-history.md)
6. Código completo
   app/repositories/price_history_repository.py
   from datetime import datetime

from app.models.price_history import PriceHistory
from app.database.connection import get_connection

SORTABLE_FIELDS = {
"recorded_at": "recorded_at",
"price": "price",
}

SORT_DIRECTIONS = {
"asc": "ASC",
"desc": "DESC",
}

class PriceHistoryRepository:

    @staticmethod
    def _get_sorting_sql(sort_by: str, sort_order: str) -> tuple[str, str]:
        """Translate public sorting values into trusted SQL fragments."""

        column = SORTABLE_FIELDS.get(sort_by)

        if column is None:
            raise ValueError("sort_by must be one of: recorded_at, price")

        direction = SORT_DIRECTIONS.get(sort_order)

        if direction is None:
            raise ValueError("sort_order must be one of: asc, desc")

        return column, direction

    def save(self, price_history: PriceHistory) -> PriceHistory:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO price_history(
                coin_id,
                price,
                recorded_at
            )
            VALUES (%s, %s, %s)
        """

        values = (
            price_history.coin_id,
            price_history.price,
            price_history.recorded_at,
        )

        try:
            cursor.execute(query, values)

            connection.commit()

            price_history.id = cursor.lastrowid

            return price_history

        finally:
            cursor.close()
            connection.close()

    def find_by_coin_id(
        self,
        coin_id: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        limit: int | None = None,
        offset: int = 0,
        sort_by: str = "recorded_at",
        sort_order: str = "asc",
    ) -> list[PriceHistory]:

        sort_column, sort_direction = self._get_sorting_sql(
            sort_by=sort_by,
            sort_order=sort_order,
        )

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                id,
                coin_id,
                price,
                recorded_at
            FROM price_history
            WHERE coin_id = %s
        """

        params = [coin_id]

        if start_date is not None:
            query += " AND recorded_at >= %s"
            params.append(start_date)

        if end_date is not None:
            query += " AND recorded_at <= %s"
            params.append(end_date)

        if min_price is not None:
            query += " AND price >= %s"
            params.append(min_price)

        if max_price is not None:
            query += " AND price <= %s"
            params.append(max_price)

        query += f" ORDER BY {sort_column} {sort_direction}, id ASC"

        if limit is not None:
            query += " LIMIT %s"
            params.append(limit)

            query += " OFFSET %s"
            params.append(offset)

        try:
            cursor.execute(query, params)

            rows = cursor.fetchall()

            return [
                PriceHistory(
                    id=row["id"],
                    coin_id=row["coin_id"],
                    price=row["price"],
                    recorded_at=row["recorded_at"],
                )
                for row in rows
            ]

        finally:
            cursor.close()
            connection.close()

    def get_statistics_by_coin_id(self, coin_id: str) -> dict:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                COUNT(*) AS count,
                MIN(price) AS min_price,
                MAX(price) AS max_price,
                AVG(price) AS average_price
            FROM price_history
            WHERE coin_id = %s
        """

        try:
            cursor.execute(query, (coin_id,))
            return cursor.fetchone()

        finally:
            cursor.close()
            connection.close()

app/services/price_history_service.py
from datetime import datetime, date, time

from app.models.price_history import PriceHistory
from app.repositories.price_history_repository import PriceHistoryRepository

VALID_SORT_FIELDS = {"recorded_at", "price"}
VALID_SORT_ORDERS = {"asc", "desc"}

class PriceHistoryService:

    def __init__(
        self,
        price_history_repository: PriceHistoryRepository,
    ):
        self.price_history_repository = price_history_repository

    def save_price(
        self,
        coin_id: str,
        price: float,
    ) -> PriceHistory:

        price_history = PriceHistory(
            id=None,
            coin_id=coin_id,
            price=price,
            recorded_at=datetime.now(),
        )

        return self.price_history_repository.save(price_history)

    def get_price_history(
        self,
        coin_id: str,
        start_date: date | None = None,
        end_date: date | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        limit: int = 20,
        offset: int = 0,
        sort_by: str = "recorded_at",
        sort_order: str = "asc",
    ) -> list[PriceHistory]:

        if start_date is not None and end_date is not None:
            if start_date > end_date:
                raise ValueError("start_date cannot be greater than end_date")

        if min_price is not None and max_price is not None:
            if min_price > max_price:
                raise ValueError("min_price cannot be greater than max_price")

        if limit <= 0:
            raise ValueError("limit must be greater than 0")

        if offset < 0:
            raise ValueError("offset cannot be negative")

        sort_by = sort_by.lower()

        if sort_by not in VALID_SORT_FIELDS:
            raise ValueError("sort_by must be one of: recorded_at, price")

        sort_order = sort_order.lower()

        if sort_order not in VALID_SORT_ORDERS:
            raise ValueError("sort_order must be one of: asc, desc")

        start_datetime = None

        if start_date is not None:
            start_datetime = datetime.combine(
                start_date,
                time.min,
            )

        end_datetime = None

        if end_date is not None:
            end_datetime = datetime.combine(
                end_date,
                time.max,
            )

        return self.price_history_repository.find_by_coin_id(
            coin_id=coin_id,
            start_date=start_datetime,
            end_date=end_datetime,
            min_price=min_price,
            max_price=max_price,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    def get_price_statistics(self, coin_id: str) -> dict:
        coin_id = coin_id.strip()

        if not coin_id:
            raise ValueError("coin_id cannot be empty")

        row = self.price_history_repository.get_statistics_by_coin_id(coin_id)

        if row is None:
            raise ValueError("statistics query returned no result")

        return {
            "coin_id": coin_id,
            "count": int(row["count"]),
            "min_price": self._to_float_or_none(row["min_price"]),
            "max_price": self._to_float_or_none(row["max_price"]),
            "average_price": self._to_float_or_none(row["average_price"]),
        }

    @staticmethod
    def _to_float_or_none(value) -> float | None:
        if value is None:
            return None

        return float(value)

app/controllers/price_history_controller.py
from datetime import date

from app.models.price_history import PriceHistory
from app.services.price_history_service import PriceHistoryService

class PriceHistoryController:

    def __init__(
        self,
        price_history_service: PriceHistoryService,
    ):
        self.price_history_service = price_history_service

    def save_price(
        self,
        coin_id: str,
        price: float,
    ) -> PriceHistory:

        return self.price_history_service.save_price(
            coin_id=coin_id,
            price=price,
        )

    def get_price_history(
        self,
        coin_id: str,
        start_date: date | None = None,
        end_date: date | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        limit: int = 20,
        offset: int = 0,
        sort_by: str = "recorded_at",
        sort_order: str = "asc",
    ) -> list[PriceHistory]:

        return self.price_history_service.get_price_history(
            coin_id=coin_id,
            start_date=start_date,
            end_date=end_date,
            min_price=min_price,
            max_price=max_price,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    def get_price_statistics(self, coin_id: str) -> dict:
        return self.price_history_service.get_price_statistics(coin_id)

app/api/app.py
Se agregó esta ruta al archivo existente:
@app.get("/coins/{coin_id}/price-history/statistics")
def get_price_statistics(
coin_id: str = Path(
...,
min_length=1,
description="ID de la criptomoneda",
)
):
return container.price_history_controller.get_price_statistics(coin_id)
El archivo completo está disponible en:
[app.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/api/app.py) 7. Tests completos
Los tests creados están disponibles aquí:
[price_history_statistics_service_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_statistics_service_test.py)
[price_history_statistics_controller_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_statistics_controller_test.py)
[price_history_statistics_repository_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_statistics_repository_test.py)
Se verificó:
estadísticas normales;
Decimal convertido a float;
criptomoneda sin historial;
coin_id vacío;
resultado inesperado del Repository;
SQL agregado;
parámetros SQL;
cierre de conexión;
delegación Controller → Service. 8. Pruebas ejecutadas
cd backend

.venv\Scripts\python.exe -m app.tests.price_history_statistics_service_test
.venv\Scripts\python.exe -m app.tests.price_history_statistics_controller_test
.venv\Scripts\python.exe -m app.tests.price_history_statistics_repository_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "\*\_test.py"
.venv\Scripts\python.exe -m compileall -q app
Resultado:
7 tests OK
Statistics Service tests: PASSED
Statistics Controller tests: PASSED
Statistics Repository tests: PASSED
compileall: OK
También se verificó que OpenAPI contiene:
/coins/{coin_id}/price-history/statistics 9. Prueba mediante Swagger
Iniciar:
cd backend
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
Abrir:
http://127.0.0.1:8000/docs
Ejecutar:
GET /coins/bitcoin/price-history/statistics
