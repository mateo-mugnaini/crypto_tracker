import pytest
from fastapi.testclient import TestClient

import app.api.app as api_app


@pytest.fixture
def api_client():
    with TestClient(api_app.app) as test_client:
        yield test_client

    api_app.app.dependency_overrides.clear()
