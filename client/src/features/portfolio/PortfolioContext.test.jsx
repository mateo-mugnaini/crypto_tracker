import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../../api/client";
import { AuthProvider } from "../../auth/AuthContext";
import { MarketProvider, useMarket } from "../market/MarketContext";
import { PortfolioProvider, usePortfolio } from "./PortfolioContext";
const portfolio = {
  holdings: [
    {
      allocation_percentage: 100,
      average_buy_price: 100,
      coin_id: "bitcoin",
      current_price: 120,
      current_value: 120,
      invested_value: 100,
      name: "Bitcoin",
      profit_loss: 20,
      profit_loss_percentage: 20,
      quantity: 1,
      symbol: "btc",
    },
  ],
  total_current_value: 120,
  total_invested: 100,
  total_profit_loss: 20,
  total_profit_loss_percentage: 20,
};
function PortfolioProbe() {
  const { portfolio: currentPortfolio } = usePortfolio();
  return _jsx("output", {
    "data-testid": "portfolio-result",
    children: currentPortfolio?.holdings[0]?.name || "loading",
  });
}
function MarketTrigger() {
  const { loadCoins, refresh } = useMarket();
  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);
  return _jsx("button", {
    onClick: () => void refresh(),
    type: "button",
    children: "Actualizar mercado",
  });
}
afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});
describe("PortfolioProvider", () => {
  it("carga la cartera autenticada y sus posiciones", async () => {
    sessionStorage.setItem("crypto_tracker_access_token", "access-token");
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({
      created_at: "2026-01-01T00:00:00Z",
      email: "mateo@example.com",
      id: 7,
      username: "mateo",
    });
    const getPortfolio = vi.spyOn(api, "getPortfolio").mockResolvedValue(portfolio);
    vi.spyOn(api, "getPortfolioOperations").mockResolvedValue({ data: [], total: 0 });
    vi.spyOn(api, "getPortfolioOperationsSummary").mockResolvedValue({
      total_invested: 0,
      total_current_value: 0,
      realized_profit_loss: 0,
      unrealized_profit_loss: 0,
      total_profit_loss: 0,
    });
    vi.spyOn(api, "getCoins").mockResolvedValue({
      data: [],
      message: "ok",
      success: true,
    });
    vi.spyOn(api, "openMarketStream").mockRejectedValue(
      new Error("stream disabled in test"),
    );
    render(
      _jsx(AuthProvider, {
        children: _jsxs(MarketProvider, {
          children: [
            _jsx(MarketTrigger, {}),
            _jsx(PortfolioProvider, { children: _jsx(PortfolioProbe, {}) }),
          ],
        }),
      }),
    );
    await waitFor(() => {
      expect(screen.getByTestId("portfolio-result")).toHaveTextContent("Bitcoin");
    });
    expect(getPortfolio).toHaveBeenCalledWith("access-token", expect.anything());
    const initialPortfolioRequests = getPortfolio.mock.calls.length;
    await userEvent.click(screen.getByRole("button", { name: "Actualizar mercado" }));
    await waitFor(() => {
      expect(getPortfolio.mock.calls.length).toBeGreaterThan(initialPortfolioRequests);
    });
  });
});
