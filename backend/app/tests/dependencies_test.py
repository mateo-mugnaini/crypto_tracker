import unittest

from fastapi.testclient import TestClient

import app.api.app as api_app


class DependenciesTest(unittest.TestCase):
    def test_lifespan_creates_the_container_for_the_application(self):
        with TestClient(api_app.app) as client:
            self.assertIsNotNone(client.app.state.container)
            self.assertIsNotNone(client.app.state.container.coin_controller)
            self.assertIsNotNone(client.app.state.container.favorite_controller)
            self.assertIsNotNone(client.app.state.container.price_history_controller)


if __name__ == "__main__":
    unittest.main()
