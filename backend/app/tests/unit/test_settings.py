import pytest

from app.config.settings import Settings


pytestmark = pytest.mark.unit


def test_settings_defaults_to_development_environment():
    settings = Settings()

    assert settings.app_env == "development"
    assert settings.mysql_pool_size == 5
    assert "http://localhost:5173" in settings.cors_allowed_origins
    assert "http://127.0.0.1:5173" in settings.cors_allowed_origins
    assert settings.price_update_enabled is False
    assert settings.price_update_interval_seconds == 300


def test_settings_rejects_unknown_environment(monkeypatch):
    monkeypatch.setenv("APP_ENV", "staging-like")

    with pytest.raises(ValueError, match="APP_ENV"):
        Settings()


def test_production_validation_rejects_local_defaults(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("JWT_SECRET_KEY", "replace_with_a_long_random_secret")

    production_settings = Settings()

    with pytest.raises(RuntimeError, match="CORS_ALLOWED_ORIGINS"):
        production_settings.validate_for_runtime()


def test_production_validation_accepts_explicit_safe_configuration(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("COINGECKO_BASE_URL", "https://api.example.com/v3")
    monkeypatch.setenv("MYSQL_HOST", "mysql.internal")
    monkeypatch.setenv("MYSQL_USER", "crypto_tracker")
    monkeypatch.setenv("MYSQL_PASSWORD", "database-password")
    monkeypatch.setenv("MYSQL_DATABASE", "crypto_tracker")
    monkeypatch.setenv(
        "JWT_SECRET_KEY",
        "a-secure-production-secret-with-more-than-32-chars",
    )
    monkeypatch.setenv("CORS_ALLOWED_ORIGINS", "https://frontend.example.com")

    production_settings = Settings()

    production_settings.validate_for_runtime()
