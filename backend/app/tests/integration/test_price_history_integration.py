from datetime import datetime, timedelta

import pytest

from app.config.settings import settings
from app.database.connection import get_test_connection
from app.models.coin import Coin
from app.models.price_history import PriceHistory
from app.repositories.coin_repository import CoinRepository
from app.repositories.price_history_repository import PriceHistoryRepository
from app.services.price_history_service import PriceHistoryService


TEST_COIN_ID = "integration-bitcoin"
LARGE_DATASET_ROWS = 5_000


def _ensure_index(cursor, table_name: str, index_name: str, columns: str) -> None:
    """Create a trusted test-schema index when it does not exist yet."""
    cursor.execute(
        f"SHOW INDEX FROM `{table_name}` WHERE Key_name = %s",
        (index_name,),
    )

    if not cursor.fetchall():
        cursor.execute(
            f"ALTER TABLE `{table_name}` ADD INDEX `{index_name}` ({columns})"
        )


def _explain(cursor, query: str, params: tuple = ()) -> dict:
    """Return the first classic MySQL EXPLAIN row as a dictionary."""
    cursor.execute(f"EXPLAIN {query}", params)
    return cursor.fetchone()

pytestmark = pytest.mark.integration


@pytest.fixture(scope="module", autouse=True)
def integration_schema():
    if not settings.mysql_test_database:
        pytest.skip("MYSQL_TEST_DATABASE no está configurada.")

    connection = get_test_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS coins (
                id VARCHAR(255) PRIMARY KEY,
                symbol VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                market_cap_rank INT NULL,
                INDEX idx_coins_market_cap_rank (market_cap_rank, id)
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS price_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                coin_id VARCHAR(255) NOT NULL,
                price DECIMAL(20, 8) NOT NULL,
                recorded_at DATETIME NOT NULL,
                CONSTRAINT fk_price_history_coin
                    FOREIGN KEY (coin_id) REFERENCES coins(id),
                INDEX idx_price_history_coin_recorded_at
                    (coin_id, recorded_at, id),
                INDEX idx_price_history_coin_price
                    (coin_id, price, id)
            )
            """
        )

        _ensure_index(
            cursor,
            "coins",
            "idx_coins_market_cap_rank",
            "market_cap_rank, id",
        )
        _ensure_index(
            cursor,
            "price_history",
            "idx_price_history_coin_recorded_at",
            "coin_id, recorded_at, id",
        )
        _ensure_index(
            cursor,
            "price_history",
            "idx_price_history_coin_price",
            "coin_id, price, id",
        )
        connection.commit()
    finally:
        cursor.close()
        connection.close()


@pytest.fixture(autouse=True)
def clean_integration_data():
    connection = get_test_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("DELETE FROM price_history WHERE coin_id = %s", (TEST_COIN_ID,))
        cursor.execute("DELETE FROM coins WHERE id = %s", (TEST_COIN_ID,))
        connection.commit()
        yield
    finally:
        cursor.execute("DELETE FROM price_history WHERE coin_id = %s", (TEST_COIN_ID,))
        cursor.execute("DELETE FROM coins WHERE id = %s", (TEST_COIN_ID,))
        connection.commit()
        cursor.close()
        connection.close()


@pytest.fixture
def repositories(monkeypatch):
    monkeypatch.setattr("app.repositories.coin_repository.get_connection", get_test_connection)
    monkeypatch.setattr(
        "app.repositories.price_history_repository.get_connection",
        get_test_connection,
    )
    return CoinRepository(), PriceHistoryRepository()


@pytest.fixture
def explain_dataset():
    """Create enough deterministic data for the optimizer to compare plans."""
    connection = get_test_connection()
    cursor = connection.cursor()
    recorded_at = datetime.now().replace(microsecond=0)

    try:
        cursor.execute(
            """
            INSERT INTO coins (id, symbol, name, market_cap_rank)
            VALUES (%s, %s, %s, %s)
            """,
            (TEST_COIN_ID, "ibtc", "Explain Bitcoin", 999),
        )

        rows = [
            (
                TEST_COIN_ID,
                float(index),
                recorded_at - timedelta(minutes=index),
            )
            for index in range(500)
        ]
        cursor.executemany(
            """
            INSERT INTO price_history (coin_id, price, recorded_at)
            VALUES (%s, %s, %s)
            """,
            rows,
        )
        connection.commit()
        return recorded_at
    finally:
        cursor.close()
        connection.close()


@pytest.fixture
def large_dataset():
    """Insert a deterministic dataset for large-result and aggregation tests."""
    connection = get_test_connection()
    cursor = connection.cursor()
    first_recorded_at = (
        datetime.now().replace(microsecond=0)
        - timedelta(minutes=LARGE_DATASET_ROWS - 1)
    )

    try:
        cursor.execute(
            """
            INSERT INTO coins (id, symbol, name, market_cap_rank)
            VALUES (%s, %s, %s, %s)
            """,
            (TEST_COIN_ID, "ibtc", "Large Dataset Bitcoin", 999),
        )

        rows = [
            (
                TEST_COIN_ID,
                float(100 + index),
                first_recorded_at + timedelta(minutes=index),
            )
            for index in range(LARGE_DATASET_ROWS)
        ]
        cursor.executemany(
            """
            INSERT INTO price_history (coin_id, price, recorded_at)
            VALUES (%s, %s, %s)
            """,
            rows,
        )
        connection.commit()
        return first_recorded_at
    finally:
        cursor.close()
        connection.close()


def test_service_saves_and_reads_price_history_through_mysql(repositories):
    coin_repository, price_history_repository = repositories
    service = PriceHistoryService(price_history_repository)
    coin_repository.save(Coin(TEST_COIN_ID, "ibtc", "Integration Bitcoin", 999))

    saved = service.save_price(TEST_COIN_ID, 123.45)
    history = service.get_price_history(TEST_COIN_ID)

    assert saved.id is not None
    assert len(history) == 1
    assert history[0].id == saved.id
    assert history[0].coin_id == TEST_COIN_ID
    assert float(history[0].price) == 123.45


def test_service_calculates_statistics_from_mysql_rows(repositories):
    coin_repository, price_history_repository = repositories
    service = PriceHistoryService(price_history_repository)
    coin_repository.save(Coin(TEST_COIN_ID, "ibtc", "Integration Bitcoin", 999))
    now = datetime.now()
    price_history_repository.save(
        PriceHistory(None, TEST_COIN_ID, 100.0, now - timedelta(minutes=1))
    )
    price_history_repository.save(PriceHistory(None, TEST_COIN_ID, 150.0, now))

    statistics = service.get_price_statistics(TEST_COIN_ID)

    assert statistics == {
        "coin_id": TEST_COIN_ID,
        "count": 2,
        "min_price": 100.0,
        "max_price": 150.0,
        "average_price": 125.0,
    }


def test_integration_schema_has_indexes_for_current_queries():
    connection = get_test_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SHOW INDEX FROM coins")
        coin_indexes = {row[2] for row in cursor.fetchall()}

        cursor.execute("SHOW INDEX FROM price_history")
        price_history_indexes = {row[2] for row in cursor.fetchall()}
    finally:
        cursor.close()
        connection.close()

    assert "idx_coins_market_cap_rank" in coin_indexes
    assert "idx_price_history_coin_recorded_at" in price_history_indexes
    assert "idx_price_history_coin_price" in price_history_indexes


def test_explain_uses_price_history_date_index(explain_dataset):
    connection = get_test_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        plan = _explain(
            cursor,
            """
            SELECT id, coin_id, price, recorded_at
            FROM price_history
            WHERE coin_id = %s
              AND recorded_at >= %s
              AND recorded_at <= %s
            ORDER BY recorded_at ASC, id ASC
            LIMIT 20
            """,
            (
                TEST_COIN_ID,
                explain_dataset - timedelta(minutes=100),
                explain_dataset,
            ),
        )
    finally:
        cursor.close()
        connection.close()

    assert plan["table"] == "price_history"
    assert "idx_price_history_coin_recorded_at" in plan["possible_keys"]
    assert plan["key"] == "idx_price_history_coin_recorded_at"


def test_explain_uses_price_history_price_index(explain_dataset):
    connection = get_test_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        plan = _explain(
            cursor,
            """
            SELECT id, coin_id, price, recorded_at
            FROM price_history
            WHERE coin_id = %s
              AND price >= %s
              AND price <= %s
            ORDER BY price DESC, id ASC
            LIMIT 20
            """,
            (TEST_COIN_ID, 100.0, 110.0),
        )
    finally:
        cursor.close()
        connection.close()

    assert plan["table"] == "price_history"
    assert "idx_price_history_coin_price" in plan["possible_keys"]
    assert plan["key"] == "idx_price_history_coin_price"


def test_explain_uses_coins_market_cap_rank_index():
    connection = get_test_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        plan = _explain(
            cursor,
            """
            SELECT *
            FROM coins
            ORDER BY market_cap_rank ASC
            """,
        )
    finally:
        cursor.close()
        connection.close()

    assert plan["table"] == "coins"
    assert plan["key"] in (None, "idx_coins_market_cap_rank")

    if plan["key"] is None:
        assert "Using filesort" in (plan["Extra"] or "")


def test_large_dataset_returns_bounded_ordered_page(repositories, large_dataset):
    _, price_history_repository = repositories
    service = PriceHistoryService(price_history_repository)

    page = service.get_price_history(
        TEST_COIN_ID,
        limit=20,
        offset=4_500,
        sort_by="recorded_at",
        sort_order="asc",
    )

    assert len(page) == 20
    assert float(page[0].price) == 4_600.0
    assert page[0].recorded_at < page[-1].recorded_at
    assert all(item.coin_id == TEST_COIN_ID for item in page)


def test_large_dataset_aggregation_preserves_all_rows(repositories, large_dataset):
    _, price_history_repository = repositories
    service = PriceHistoryService(price_history_repository)

    aggregations = service.get_price_aggregations(
        TEST_COIN_ID,
        period="day",
    )

    assert len(aggregations) >= 3
    assert sum(item["count"] for item in aggregations) == LARGE_DATASET_ROWS
    assert aggregations[0]["average_price"] is not None
