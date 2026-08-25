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
}

export interface CoinListResponse {
  success: boolean;
  message: string;
  data: Coin[];
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
