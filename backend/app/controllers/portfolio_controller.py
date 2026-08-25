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
