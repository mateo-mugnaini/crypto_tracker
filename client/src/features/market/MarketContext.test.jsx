import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
  return _jsx("output", {
    "data-testid": "market-result",
    children: coins[0]?.name || "loading",
  });
}
afterEach(() => {
  vi.restoreAllMocks();
});
describe("MarketProvider", () => {
  it("comparte una única request concurrente entre consumidores", async () => {
    const getCoins = vi.spyOn(api, "getCoins").mockResolvedValue(response);
    render(
      _jsxs(MarketProvider, {
        children: [_jsx(MarketProbe, {}), _jsx(MarketProbe, {})],
      }),
    );
    await waitFor(() => {
      expect(screen.getAllByTestId("market-result")).toHaveLength(2);
      expect(screen.getAllByTestId("market-result")[0]).toHaveTextContent("Bitcoin");
    });
    expect(getCoins).toHaveBeenCalledOnce();
  });
});
