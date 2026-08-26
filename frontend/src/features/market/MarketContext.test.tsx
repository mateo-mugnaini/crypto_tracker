import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "../../api/client";
import { MarketProvider, useMarket } from "./MarketContext";

const response = {
  data: [
    {
      current_price: 100,
      id: "bitcoin",
      market_cap_rank: 1,
      name: "Bitcoin",
      symbol: "btc",
    },
  ],
  message: "ok",
  success: true,
};

function MarketProbe() {
  const { coins, loadCoins } = useMarket();

  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);

  return <output data-testid="market-result">{coins[0]?.name || "loading"}</output>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MarketProvider", () => {
  it("comparte una única request concurrente entre consumidores", async () => {
    const getCoins = vi.spyOn(api, "getCoins").mockResolvedValue(response);

    render(
      <MarketProvider>
        <MarketProbe />
        <MarketProbe />
      </MarketProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("market-result")).toHaveLength(2);
      expect(screen.getAllByTestId("market-result")[0]).toHaveTextContent("Bitcoin");
    });
    expect(getCoins).toHaveBeenCalledOnce();
  });
});
