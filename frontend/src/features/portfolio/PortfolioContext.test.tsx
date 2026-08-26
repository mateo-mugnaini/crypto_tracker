import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "../../api/client";
import { AuthProvider } from "../../auth/AuthContext";
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
  return (
    <output data-testid="portfolio-result">
      {currentPortfolio?.holdings[0]?.name || "loading"}
    </output>
  );
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

    render(
      <AuthProvider>
        <PortfolioProvider>
          <PortfolioProbe />
        </PortfolioProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("portfolio-result")).toHaveTextContent("Bitcoin");
    });
    expect(getPortfolio).toHaveBeenCalledWith("access-token");
  });
});
