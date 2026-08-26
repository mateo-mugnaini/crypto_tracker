class PortfolioController:
    def __init__(self, service):
        self.service = service

    def get_portfolio(self, user_id: int):
        return self.service.get_portfolio(user_id)

    def save_or_update_holding(self, user_id: int, holding_request):
        self.service.save_or_update_holding(user_id, holding_request)
        return self.service.get_portfolio(user_id)

    def remove_holding(self, user_id: int, coin_id: str):
        success, message = self.service.remove_holding(user_id, coin_id)
        return {"success": success, "message": message}

    def get_operations(self, user_id: int):
        return self.service.get_operations(user_id)

    def get_operations_summary(self, user_id: int):
        return self.service.get_operations_summary(user_id)

    def create_operation(self, user_id: int, operation_request):
        return self.service.create_operation(user_id, operation_request)

    def update_operation(self, user_id: int, operation_id: int, operation_request):
        return self.service.update_operation(user_id, operation_id, operation_request)

    def remove_operation(self, user_id: int, operation_id: int):
        return self.service.remove_operation(user_id, operation_id)
