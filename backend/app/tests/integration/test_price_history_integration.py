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
                market_cap_rank INT NULL
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
                    FOREIGN KEY (coin_id) REFERENCES coins(id)
            )
            """
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
