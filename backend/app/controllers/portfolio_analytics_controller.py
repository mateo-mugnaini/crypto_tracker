class PortfolioAnalyticsController:
    def __init__(self, service):
        self.service = service

    def get_analytics(self, user_id: int, days: int, benchmark_coin_id: str | None = None):
        return self.service.get_analytics(user_id, days, benchmark_coin_id)
