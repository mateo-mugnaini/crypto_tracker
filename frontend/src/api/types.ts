export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  current_price: number | null;
}

export interface MarketSnapshotEvent {
  coin_id: string;
  price: number;
  recorded_at: string;
  symbol: string | null;
  name: string | null;
}

export interface CoinListResponse {
  success: boolean;
  message: string;
  data: Coin[];
}

export interface CoinResponse {
  success: boolean;
  message: string;
  data: Coin;
}

export interface Favorite {
  user_id: number;
  coin_id: string;
}

export interface FavoriteDetails {
  coin_id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
}

export interface FavoriteListResponse {
  success: boolean;
  data: Favorite[];
}

export interface FavoriteDetailsListResponse {
  success: boolean;
  data: FavoriteDetails[];
}

export interface FavoriteActionResponse {
  success: boolean;
  message: string;
}

export interface PortfolioHoldingInput {
  coin_id: string;
  quantity: number;
  average_buy_price: number;
}

export interface PortfolioHolding {
  coin_id: string;
  symbol: string;
  name: string;
  quantity: number;
  average_buy_price: number;
  invested_value: number;
  current_price: number | null;
  current_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  allocation_percentage: number | null;
}

export interface PortfolioResponse {
  total_invested: number;
  total_current_value: number | null;
  total_profit_loss: number | null;
  total_profit_loss_percentage: number | null;
  holdings: PortfolioHolding[];
}

export interface PortfolioActionResponse {
  success: boolean;
  message: string;
}

export type PortfolioOperationType = "buy" | "sell";

export interface PortfolioOperationInput {
  coin_id: string;
  operation_type: PortfolioOperationType;
  quantity: number;
  price_usd: number;
  fee_usd: number;
  executed_at: string;
  note?: string | null;
}

export interface PortfolioOperation extends PortfolioOperationInput {
  id: number;
  symbol: string;
  name: string;
}

export interface PortfolioOperationsResponse {
  data: PortfolioOperation[];
  total: number;
}

export interface PortfolioOperationsSummary {
  total_invested: number;
  total_current_value: number | null;
  realized_profit_loss: number;
  unrealized_profit_loss: number | null;
  total_profit_loss: number | null;
}

export interface PortfolioAnalyticsPoint {
  timestamp: string;
  value: number;
  invested: number;
}

export interface PortfolioAnalyticsAsset {
  coin_id: string;
  symbol: string;
  name: string;
  quantity: number;
  invested: number;
  current_price: number | null;
  current_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  allocation_percentage: number | null;
}

export interface PortfolioBenchmarkPoint {
  timestamp: string;
  percentage_change: number;
}

export interface PortfolioAnalytics {
  period_days: number;
  period_start: string;
  period_end: string;
  points: PortfolioAnalyticsPoint[];
  assets: PortfolioAnalyticsAsset[];
  total_return_percentage: number | null;
  max_drawdown_percentage: number | null;
  volatility_percentage: number | null;
  benchmark_coin_id: string | null;
  benchmark: PortfolioBenchmarkPoint[];
}

export type PriceAlertCondition = "above" | "below";

export interface PriceAlertInput {
  coin_id: string;
  condition: PriceAlertCondition;
  target_price: number;
}

export interface PriceAlert extends PriceAlertInput {
  id: number;
  symbol: string;
  name: string;
  is_active: boolean;
  current_price: number | null;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceAlertListResponse {
  data: PriceAlert[];
  total: number;
}

export interface Notification {
  id: number;
  alert_id: number | null;
  coin_id: string | null;
  symbol: string | null;
  name: string | null;
  title: string;
  message: string;
  current_price: number | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  unread: number;
}

export interface PriceHistoryRecord {
  id: number | null;
  coin_id: string;
  price: number;
  recorded_at: string;
}

export interface PriceHistoryStatistics {
  coin_id: string;
  count: number;
  min_price: number | null;
  max_price: number | null;
  average_price: number | null;
}

export interface PriceHistoryVariation {
  coin_id: string;
  initial_price: number | null;
  final_price: number | null;
  absolute_change: number | null;
  percentage_change: number | null;
  trend: "up" | "down" | "unchanged" | null;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiErrorPayload {
  detail?: ApiErrorDetail | ValidationErrorItem[];
}

export interface ValidationErrorItem {
  loc: Array<string | number>;
  msg: string;
  type: string;
}
