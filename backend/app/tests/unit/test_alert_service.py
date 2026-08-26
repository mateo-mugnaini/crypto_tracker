from unittest.mock import Mock

import pytest

from app.services.alert_service import AlertService


pytestmark = pytest.mark.unit


def make_service():
    repository = Mock()
    users = Mock()
    coins = Mock()
    users.exists.return_value = True
    coins.exists.return_value = True
    return AlertService(repository, users, coins), repository


def test_evaluate_coin_creates_one_notification_when_price_enters_zone():
    service, repository = make_service()
    repository.find_active_by_coin.return_value = [
        {
            "id": 4,
            "user_id": 7,
            "coin_id": "bitcoin",
            "condition": "above",
            "target_price": 100,
            "last_condition_met": None,
        }
    ]
    repository.claim_trigger.return_value = True

    assert service.evaluate_coin("bitcoin", 101) == 1
    repository.create_notification.assert_called_once()


def test_evaluate_coin_does_not_duplicate_while_condition_remains_met():
    service, repository = make_service()
    repository.claim_trigger.return_value = False
    repository.find_active_by_coin.return_value = [
        {
            "id": 4,
            "user_id": 7,
            "coin_id": "bitcoin",
            "condition": "above",
            "target_price": 100,
            "last_condition_met": True,
        }
    ]

    assert service.evaluate_coin("bitcoin", 101) == 0
    repository.claim_trigger.assert_called_once_with(4)
    repository.create_notification.assert_not_called()


def test_evaluate_coin_resets_state_after_price_leaves_zone():
    service, repository = make_service()
    repository.find_active_by_coin.return_value = [
        {
            "id": 4,
            "user_id": 7,
            "coin_id": "bitcoin",
            "condition": "below",
            "target_price": 100,
            "last_condition_met": True,
        }
    ]

    assert service.evaluate_coin("bitcoin", 101) == 0
    repository.reset_trigger.assert_called_once_with(4)
