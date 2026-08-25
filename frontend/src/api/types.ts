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
