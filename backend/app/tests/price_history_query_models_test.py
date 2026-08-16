import unittest
from datetime import date
from unittest.mock import Mock

import app.api.app as api_app
from app.schemas.price_history import (
    PriceHistoryAggregationQueryParams,
    PriceHistoryDateRangeQueryParams,
    PriceHistoryQueryParams,
)


class PriceHistoryQueryModelsTest(unittest.TestCase):
    def test_price_history_query_model_normalizes_and_keeps_defaults(self):
        query = PriceHistoryQueryParams(sort_by=" PRICE ", sort_order=" DESC ")

        self.assertEqual(query.limit, 20)
        self.assertEqual(query.offset, 0)
        self.assertEqual(query.sort_by, "price")
        self.assertEqual(query.sort_order, "desc")

    def test_price_history_query_model_rejects_invalid_date_range(self):
        with self.assertRaisesRegex(ValueError, "start_date cannot be greater than end_date"):
            PriceHistoryQueryParams(start_date=date(2026, 8, 8), end_date=date(2026, 8, 7))

    def test_price_history_query_model_rejects_invalid_price_range(self):
        with self.assertRaisesRegex(ValueError, "min_price cannot be greater than max_price"):
            PriceHistoryQueryParams(min_price=65000, max_price=64000)

    def test_price_history_date_range_model_rejects_invalid_date_range(self):
        with self.assertRaisesRegex(ValueError, "start_date cannot be greater than end_date"):
            PriceHistoryDateRangeQueryParams(
                start_date=date(2026, 8, 8), end_date=date(2026, 8, 7)
            )

    def test_price_history_aggregation_model_normalizes_period(self):
        query = PriceHistoryAggregationQueryParams(period=" WEEK ")

        self.assertEqual(query.period, "week")

    def test_get_price_history_route_uses_validated_filters(self):
        controller = Mock()
        controller.get_price_history.return_value = []
        filters = PriceHistoryQueryParams(limit=10, offset=5, sort_by=" PRICE ", sort_order=" DESC ")

        result = api_app.get_price_history(
            coin_id="bitcoin",
            filters=filters,
            controller=controller,
        )

        self.assertEqual(result, [])
        controller.get_price_history.assert_called_once_with(
            coin_id="bitcoin", start_date=None, end_date=None, min_price=None,
            max_price=None, limit=10, offset=5, sort_by="price", sort_order="desc",
        )

    def test_get_price_variation_route_uses_date_range_filters(self):
        controller = Mock()
        controller.get_price_variation.return_value = {"trend": "up"}
        filters = PriceHistoryDateRangeQueryParams(
            start_date=date(2026, 8, 1), end_date=date(2026, 8, 10)
        )

        result = api_app.get_price_variation(
            coin_id="bitcoin", filters=filters, controller=controller
        )

        self.assertEqual(result["trend"], "up")
        controller.get_price_variation.assert_called_once_with(
            coin_id="bitcoin", start_date=date(2026, 8, 1), end_date=date(2026, 8, 10)
        )

    def test_get_price_aggregations_route_uses_aggregation_filters(self):
        controller = Mock()
        controller.get_price_aggregations.return_value = [{"period": "2026-08-01"}]
        filters = PriceHistoryAggregationQueryParams(
            period=" DAY ", start_date=date(2026, 8, 1), end_date=date(2026, 8, 31)
        )

        result = api_app.get_price_aggregations(
            coin_id="bitcoin", filters=filters, controller=controller
        )

        self.assertEqual(result[0]["period"], "2026-08-01")
        controller.get_price_aggregations.assert_called_once_with(
            coin_id="bitcoin", period="day", start_date=date(2026, 8, 1), end_date=date(2026, 8, 31)
        )


if __name__ == "__main__":
    unittest.main()
