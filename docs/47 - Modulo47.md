Módulo 47 — Agregaciones temporales de Price History
M47 está implementado y probado.

1.  Objetivo
    Agrupar precios por:
    hour
    day
    week
    Nuevo endpoint:
    GET /coins/{coin_id}/price-history/aggregations?period=day
    Respuesta:
    [
    {
    "period": "2026-08-01",
    "average_price": 105.0,
    "min_price": 100.0,
    "max_price": 110.0,
    "count": 2
    }
    ]
    Si no existen registros:
    []
2.  Conceptos aprendidos
    GROUP BY.
    AVG, MIN, MAX, COUNT.
    Agrupaciones por hora, día y semana.
    DATE.
    DATE_FORMAT.
    DATE_SUB.
    WEEKDAY.
    Whitelist de expresiones SQL.
    Análisis temporal.
    Diferencia entre agregación global y temporal.
3.  Expresiones SQL utilizadas
    Por hora
    DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00')
    Por día
    DATE(recorded_at)
    Por semana
    DATE_SUB(
    DATE(recorded_at),
    INTERVAL WEEKDAY(recorded_at) DAY
    )
    La semana comienza el lunes.
4.  Seguridad
    No se utiliza directamente:
    query += f" GROUP BY {period}"
    Se utiliza una whitelist:
    AGGREGATION_PERIODS = {
    "hour": "DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00')",
    "day": "DATE(recorded_at)",
    "week": (
    "DATE_SUB(DATE(recorded_at), "
    "INTERVAL WEEKDAY(recorded_at) DAY)"
    ),
    }
    Solo esas expresiones pueden llegar al SQL.
5.  SQL generado
    SELECT
    DATE(recorded_at) AS period,
    AVG(price) AS average_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price,
    COUNT(\*) AS count
    FROM price_history
    WHERE coin_id = %s
    AND recorded_at >= %s
    AND recorded_at <= %s
    GROUP BY DATE(recorded_at)
    ORDER BY DATE(recorded_at) ASC;
6.  Código principal
    Repository
    Archivo completo:
    [price_history_repository.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/repositories/price_history_repository.py)
    Código agregado:
    AGGREGATION_PERIODS = {
    "hour": "DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00')",
    "day": "DATE(recorded_at)",
    "week": (
    "DATE_SUB(DATE(recorded_at), "
    "INTERVAL WEEKDAY(recorded_at) DAY)"
    ),
    }
    def get_price_aggregations(
    self,
    coin_id: str,
    period: str,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    ) -> list[dict]:
    period_expression = self.\_get_aggregation_period_sql(period)

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        conditions = ["coin_id = %s"]
        params = [coin_id]

        if start_date is not None:
            conditions.append("recorded_at >= %s")
            params.append(start_date)

        if end_date is not None:
            conditions.append("recorded_at <= %s")
            params.append(end_date)

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT
                {period_expression} AS period,
                AVG(price) AS average_price,
                MIN(price) AS min_price,
                MAX(price) AS max_price,
                COUNT(*) AS count
            FROM price_history
            WHERE {where_clause}
            GROUP BY {period_expression}
            ORDER BY {period_expression} ASC
        """

        try:
            cursor.execute(query, tuple(params))
            return cursor.fetchall()

        finally:
            cursor.close()
            connection.close()

    Service
    Archivo completo:
    [price_history_service.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/services/price_history_service.py)
    VALID_AGGREGATION_PERIODS = {"hour", "day", "week"}
    def get_price_aggregations(
    self,
    coin_id: str,
    period: str = "day",
    start_date: date | None = None,
    end_date: date | None = None,
    ) -> list[dict]:
    coin_id = coin_id.strip()

        if not coin_id:
            raise ValueError("coin_id cannot be empty")

        period = period.lower()

        if period not in VALID_AGGREGATION_PERIODS:
            raise ValueError("period must be one of: hour, day, week")

        if start_date is not None and end_date is not None:
            if start_date > end_date:
                raise ValueError("start_date cannot be greater than end_date")

        start_datetime = None

        if start_date is not None:
            start_datetime = datetime.combine(start_date, time.min)

        end_datetime = None

        if end_date is not None:
            end_datetime = datetime.combine(end_date, time.max)

        rows = self.price_history_repository.get_price_aggregations(
            coin_id=coin_id,
            period=period,
            start_date=start_datetime,
            end_date=end_datetime,
        )

        return [
            {
                "period": str(row["period"]),
                "average_price": self._to_float_or_none(
                    row["average_price"]
                ),
                "min_price": self._to_float_or_none(row["min_price"]),
                "max_price": self._to_float_or_none(row["max_price"]),
                "count": int(row["count"]),
            }
            for row in rows
        ]

    Controller
    Archivo completo:
    [price_history_controller.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/controllers/price_history_controller.py)
    def get_price_aggregations(
    self,
    coin_id: str,
    period: str = "day",
    start_date: date | None = None,
    end_date: date | None = None,
    ) -> list[dict]:
    return self.price_history_service.get_price_aggregations(
    coin_id=coin_id,
    period=period,
    start_date=start_date,
    end_date=end_date,
    )
    API
    Archivo completo:
    [app.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/api/app.py)
    @app.get("/coins/{coin_id}/price-history/aggregations")
    def get_price_aggregations(
    coin_id: str = Path(
    ...,
    min_length=1,
    description="ID de la criptomoneda",
    ),
    period: Literal["hour", "day", "week"] = Query(
    default="day",
    description="Periodo de agregación",
    ),
    start_date: date | None = None,
    end_date: date | None = None,
    ):
    return container.price_history_controller.get_price_aggregations(
    coin_id=coin_id,
    period=period,
    start_date=start_date,
    end_date=end_date,
    )

7.  Tests
    Archivos creados:
    [price_history_aggregation_service_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_aggregation_service_test.py)
    [price_history_aggregation_controller_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_aggregation_controller_test.py)
    [price_history_aggregation_repository_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/price_history_aggregation_repository_test.py)
    Se probaron:
    agregación diaria;
    período semanal;
    fechas;
    conversión de Decimal;
    lista vacía;
    período inválido;
    rango inválido;
    GROUP BY;
    funciones agregadas;
    orden cronológico;
    delegación entre capas.
8.  Pruebas ejecutadas
    cd backend

.venv\Scripts\python.exe -m app.tests.price_history_aggregation_service_test
.venv\Scripts\python.exe -m app.tests.price_history_aggregation_controller_test
.venv\Scripts\python.exe -m app.tests.price_history_aggregation_repository_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "\*\_test.py"
.venv\Scripts\python.exe -m compileall -q app
Resultado:
10 tests OK
Aggregation Service tests: PASSED
Aggregation Controller tests: PASSED
Aggregation Repository tests: PASSED
compileall: OK
OpenAPI también fue verificado:
period = hour, day, week 9. Swagger
Iniciar:
cd backend
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
Abrir:
http://127.0.0.1:8000/docs
Probar:
GET /coins/bitcoin/price-history/aggregations?period=hour
GET /coins/bitcoin/price-history/aggregations?period=day
GET /coins/bitcoin/price-history/aggregations?period=week
Con fechas:
GET /coins/bitcoin/price-history/aggregations?period=day&start_date=2026-08-01&end_date=2026-08-31
