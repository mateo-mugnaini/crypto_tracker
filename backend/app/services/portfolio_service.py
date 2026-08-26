from app.exceptions.domain_exception import (
    CoinNotFoundException,
    InsufficientPortfolioBalanceException,
    PortfolioHoldingNotFoundException,
    PortfolioOperationNotFoundException,
    UserNotFoundException,
)
from app.models.portfolio_holding import PortfolioHolding
from app.models.portfolio_operation import PortfolioOperation


class PortfolioService:
    def __init__(self, portfolio_repository, user_repository, coin_repository):
        self.portfolio_repository = portfolio_repository
        self.user_repository = user_repository
        self.coin_repository = coin_repository

    def save_or_update_holding(self, user_id: int, holding_request):
        self._ensure_user_exists(user_id)
        self._ensure_coin_exists(holding_request.coin_id)

        holding = PortfolioHolding(
            user_id=user_id,
            coin_id=holding_request.coin_id,
            quantity=holding_request.quantity,
            average_buy_price=holding_request.average_buy_price,
        )
        self.portfolio_repository.save_or_update(holding)
        return holding

    def remove_holding(self, user_id: int, coin_id: str):
        self._ensure_user_exists(user_id)
        if not self.portfolio_repository.exists(user_id, coin_id):
            raise PortfolioHoldingNotFoundException("La posición no existe en tu cartera.")

        self.portfolio_repository.delete(user_id, coin_id)
        return True, "Posición eliminada de la cartera."

    def get_portfolio(self, user_id: int) -> dict:
        self._ensure_user_exists(user_id)
        rows = self.portfolio_repository.find_all_by_user(user_id)
        holdings = []
        total_invested = 0.0
        complete_market_value = True
        total_current_value = 0.0

        for row in rows:
            quantity = float(row["quantity"])
            average_buy_price = float(row["average_buy_price"])
            invested_value = quantity * average_buy_price
            current_price = self._as_float(row.get("current_price"))
            current_value = None if current_price is None else quantity * current_price
            profit_loss = None if current_value is None else current_value - invested_value
            profit_loss_percentage = (
                None
                if profit_loss is None or invested_value == 0
                else (profit_loss / invested_value) * 100
            )

            total_invested += invested_value
            if current_value is None:
                complete_market_value = False
            else:
                total_current_value += current_value

            holdings.append(
                {
                    "coin_id": row["coin_id"],
                    "symbol": row["symbol"],
                    "name": row["name"],
                    "quantity": quantity,
                    "average_buy_price": average_buy_price,
                    "invested_value": invested_value,
                    "current_price": current_price,
                    "current_value": current_value,
                    "profit_loss": profit_loss,
                    "profit_loss_percentage": profit_loss_percentage,
                }
            )

        market_value = total_current_value if complete_market_value else None
        total_profit_loss = None if market_value is None else market_value - total_invested
        total_profit_loss_percentage = (
            None
            if total_profit_loss is None or total_invested == 0
            else (total_profit_loss / total_invested) * 100
        )

        for holding in holdings:
            current_value = holding["current_value"]
            holding["allocation_percentage"] = (
                None
                if current_value is None or market_value in (None, 0)
                else (current_value / market_value) * 100
            )

        return {
            "total_invested": total_invested,
            "total_current_value": market_value,
            "total_profit_loss": total_profit_loss,
            "total_profit_loss_percentage": total_profit_loss_percentage,
            "holdings": holdings,
        }

    def _ensure_user_exists(self, user_id: int):
        if not self.user_repository.exists(user_id):
            raise UserNotFoundException("El usuario no existe.")

    def _ensure_coin_exists(self, coin_id: str):
        if not self.coin_repository.exists(coin_id):
            raise CoinNotFoundException("La moneda no existe.")

    @staticmethod
    def _as_float(value):
        return None if value is None else float(value)

    def get_operations(self, user_id: int) -> dict:
        self._ensure_user_exists(user_id)
        operations = self.portfolio_repository.find_operations_by_user(user_id)
        return {"data": operations, "total": len(operations)}

    def get_operations_summary(self, user_id: int) -> dict:
        self._ensure_user_exists(user_id)
        rows = self.portfolio_repository.find_operations_by_user(user_id)
        balances: dict[str, dict[str, float | None]] = {}
        realized_profit_loss = 0.0

        for row in reversed(rows):
            balance = balances.setdefault(row["coin_id"], {"quantity": 0.0, "cost": 0.0, "current_price": None})
            quantity = float(row["quantity"])
            price = float(row["price_usd"])
            fee = float(row["fee_usd"])

            if row["operation_type"] == "buy":
                balance["quantity"] = float(balance["quantity"] or 0) + quantity
                balance["cost"] = float(balance["cost"] or 0) + quantity * price + fee
            else:
                available_quantity = float(balance["quantity"] or 0)
                average_cost = float(balance["cost"] or 0) / available_quantity if available_quantity else 0
                realized_profit_loss += quantity * price - fee - quantity * average_cost
                balance["quantity"] = available_quantity - quantity
                balance["cost"] = max(0.0, float(balance["cost"] or 0) - quantity * average_cost)

            balance["current_price"] = self._as_float(row.get("current_price"))

        total_invested = sum(float(balance["cost"] or 0) for balance in balances.values())
        total_current_value = 0.0
        complete_market_value = True
        for balance in balances.values():
            quantity = float(balance["quantity"] or 0)
            current_price = balance["current_price"]
            if quantity > 0 and current_price is None:
                complete_market_value = False
            elif current_price is not None:
                total_current_value += quantity * float(current_price)

        current_value = total_current_value if complete_market_value else None
        unrealized = None if current_value is None else current_value - total_invested
        total_profit_loss = None if unrealized is None else realized_profit_loss + unrealized
        return {
            "total_invested": total_invested,
            "total_current_value": current_value,
            "realized_profit_loss": realized_profit_loss,
            "unrealized_profit_loss": unrealized,
            "total_profit_loss": total_profit_loss,
        }

    def create_operation(self, user_id: int, operation_request):
        self._ensure_user_exists(user_id)
        self._ensure_coin_exists(operation_request.coin_id)
        self._ensure_sell_balance(user_id, operation_request)

        operation = PortfolioOperation(
            user_id=user_id,
            coin_id=operation_request.coin_id,
            operation_type=operation_request.operation_type,
            quantity=operation_request.quantity,
            price_usd=operation_request.price_usd,
            fee_usd=operation_request.fee_usd,
            executed_at=operation_request.executed_at,
            note=operation_request.note,
        )
        operation.id = self.portfolio_repository.create_operation(operation)
        return self.portfolio_repository.find_operation(user_id, operation.id)

    def update_operation(self, user_id: int, operation_id: int, operation_request):
        self._ensure_user_exists(user_id)
        current = self._get_operation(user_id, operation_id)
        self._ensure_coin_exists(operation_request.coin_id)
        self._ensure_sell_balance(user_id, operation_request, operation_id)

        operation = PortfolioOperation(
            user_id=user_id,
            coin_id=operation_request.coin_id,
            operation_type=operation_request.operation_type,
            quantity=operation_request.quantity,
            price_usd=operation_request.price_usd,
            fee_usd=operation_request.fee_usd,
            executed_at=operation_request.executed_at,
            note=operation_request.note,
            operation_id=current["id"],
        )
        self.portfolio_repository.update_operation(operation)
        return self.portfolio_repository.find_operation(user_id, operation_id)

    def remove_operation(self, user_id: int, operation_id: int):
        self._ensure_user_exists(user_id)
        self._get_operation(user_id, operation_id)
        self.portfolio_repository.delete_operation(user_id, operation_id)
        return {"success": True, "message": "Operación eliminada de la cartera."}

    def _get_operation(self, user_id: int, operation_id: int) -> dict:
        operation = self.portfolio_repository.find_operation(user_id, operation_id)
        if operation is None:
            raise PortfolioOperationNotFoundException("La operación no existe en tu cartera.")
        return operation

    def _ensure_sell_balance(
        self,
        user_id: int,
        operation_request,
        exclude_operation_id: int | None = None,
    ):
        if operation_request.operation_type != "sell":
            return

        available_quantity = self.portfolio_repository.get_net_quantity(
            user_id,
            operation_request.coin_id,
            exclude_operation_id,
        )
        if operation_request.quantity > available_quantity + 1e-12:
            raise InsufficientPortfolioBalanceException(
                "La cantidad a vender supera el saldo disponible de la moneda."
            )
