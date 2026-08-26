from datetime import datetime, timedelta
from math import sqrt
from statistics import pstdev

from app.exceptions.domain_exception import CoinNotFoundException, UserNotFoundException


class PortfolioAnalyticsService:
    def __init__(self, portfolio_repository, price_history_repository, user_repository, coin_repository):
        self.portfolio_repository = portfolio_repository
        self.price_history_repository = price_history_repository
        self.user_repository = user_repository
        self.coin_repository = coin_repository

    def get_analytics(self, user_id: int, days: int = 30, benchmark_coin_id: str | None = None) -> dict:
        if not self.user_repository.exists(user_id):
            raise UserNotFoundException("El usuario no existe.")
        if days < 1 or days > 365:
            raise ValueError("days must be between 1 and 365")

        period_end = datetime.now()
        period_start = period_end - timedelta(days=days)
        if benchmark_coin_id:
            benchmark_coin_id = benchmark_coin_id.strip().lower()
            if not self.coin_repository.exists(benchmark_coin_id):
                raise CoinNotFoundException("La moneda benchmark no existe.")
        operations = sorted(
            self.portfolio_repository.find_operations_by_user(user_id),
            key=lambda row: (row["executed_at"], row.get("id", 0)),
        )
        coin_ids = list(dict.fromkeys(row["coin_id"] for row in operations))
        histories: dict[str, list] = {}
        for coin_id in coin_ids:
            histories[coin_id] = self.price_history_repository.find_by_coin_id(
                coin_id=coin_id,
                start_date=period_start,
                end_date=period_end,
                sort_order="asc",
            )

        states: dict[str, dict[str, float]] = {}
        operation_index = 0
        prices: dict[str, float] = {}
        points = []

        def apply_operations(until: datetime):
            nonlocal operation_index
            while operation_index < len(operations) and operations[operation_index]["executed_at"] <= until:
                operation = operations[operation_index]
                state = states.setdefault(operation["coin_id"], {"quantity": 0.0, "cost": 0.0})
                quantity = float(operation["quantity"])
                price = float(operation["price_usd"])
                fee = float(operation["fee_usd"])
                if operation["operation_type"] == "buy":
                    state["quantity"] += quantity
                    state["cost"] += quantity * price + fee
                else:
                    average_cost = state["cost"] / state["quantity"] if state["quantity"] > 0 else 0
                    state["quantity"] = max(0.0, state["quantity"] - quantity)
                    state["cost"] = max(0.0, state["cost"] - quantity * average_cost)
                operation_index += 1

        for coin_id in coin_ids:
            for record in histories[coin_id]:
                apply_operations(record.recorded_at)
                prices[coin_id] = float(record.price)
                value = sum(state["quantity"] * prices.get(key, 0) for key, state in states.items())
                invested = sum(state["cost"] for state in states.values())
                points.append({"timestamp": record.recorded_at, "value": value, "invested": invested})

        points.sort(key=lambda point: point["timestamp"])
        apply_operations(period_end)

        current_prices = {}
        for coin_id in coin_ids:
            latest = self.price_history_repository.find_by_coin_id(
                coin_id=coin_id, limit=1, sort_order="desc"
            )
            if latest:
                current_prices[coin_id] = float(latest[0].price)

        total_value = sum(
            state["quantity"] * current_prices[key]
            for key, state in states.items()
            if key in current_prices and state["quantity"] > 0
        )
        assets = []
        for operation in operations:
            coin_id = operation["coin_id"]
            if any(asset["coin_id"] == coin_id for asset in assets):
                continue
            state = states.get(coin_id, {"quantity": 0.0, "cost": 0.0})
            quantity = state["quantity"]
            price = current_prices.get(coin_id)
            current_value = None if price is None else quantity * price
            invested = state["cost"]
            profit_loss = None if current_value is None else current_value - invested
            assets.append(
                {
                    "coin_id": coin_id,
                    "symbol": operation["symbol"],
                    "name": operation["name"],
                    "quantity": quantity,
                    "invested": invested,
                    "current_price": price,
                    "current_value": current_value,
                    "profit_loss": profit_loss,
                    "profit_loss_percentage": None if not invested or profit_loss is None else profit_loss / invested * 100,
                    "allocation_percentage": None if not total_value or current_value is None else current_value / total_value * 100,
                }
            )

        values = [point["value"] for point in points if point["value"] > 0]
        returns = [((right - left) / left) * 100 for left, right in zip(values, values[1:]) if left]
        total_return = None if len(values) < 2 or values[0] == 0 else (values[-1] - values[0]) / values[0] * 100
        peak = 0.0
        drawdown = 0.0
        for value in values:
            peak = max(peak, value)
            if peak:
                drawdown = min(drawdown, (value - peak) / peak * 100)

        benchmark = self._get_benchmark(benchmark_coin_id, period_start, period_end)
        return {
            "period_days": days,
            "period_start": period_start,
            "period_end": period_end,
            "points": points,
            "assets": assets,
            "total_return_percentage": total_return,
            "max_drawdown_percentage": abs(drawdown) if values else None,
            "volatility_percentage": pstdev(returns) * sqrt(365) if len(returns) > 1 else None,
            "benchmark_coin_id": benchmark_coin_id,
            "benchmark": benchmark,
        }

    def _get_benchmark(self, coin_id: str | None, start: datetime, end: datetime) -> list[dict]:
        if not coin_id:
            return []
        records = self.price_history_repository.find_by_coin_id(
            coin_id=coin_id, start_date=start, end_date=end, sort_order="asc"
        )
        base = float(records[0].price) if records else 0
        return [
            {"timestamp": record.recorded_at, "percentage_change": 0 if not base else (float(record.price) - base) / base * 100}
            for record in records
        ]
