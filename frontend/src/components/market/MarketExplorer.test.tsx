import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "../../api/client";
import { AuthProvider } from "../../auth/AuthContext";
import { FavoritesProvider } from "../../features/favorites/FavoritesContext";
import {
  invalidateMarketCache,
  MarketProvider,
} from "../../features/market/MarketContext";
import { ToastProvider } from "../ui/ToastProvider";
import MarketExplorer from "./MarketExplorer";

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

afterEach(() => {
  invalidateMarketCache();
  vi.restoreAllMocks();
});

describe("MarketExplorer", () => {
  it("filtra localmente y conserva los filtros en la URL", async () => {
    vi.spyOn(api, "getCoins").mockResolvedValue({
      data: [
        {
          current_price: 100,
          id: "bitcoin",
          market_cap_rank: 1,
          name: "Bitcoin",
          symbol: "btc",
        },
        {
          current_price: null,
          id: "ethereum",
          market_cap_rank: 2,
          name: "Ethereum",
          symbol: "eth",
        },
      ],
      message: "ok",
      success: true,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <FavoritesProvider>
            <MarketProvider>
              <ToastProvider>
                <MarketExplorer />
                <LocationProbe />
              </ToastProvider>
            </MarketProvider>
          </FavoritesProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Bitcoin")).toBeInTheDocument());
    await user.type(screen.getByLabelText("Buscar moneda"), "bitcoin");
    await user.click(screen.getByRole("button", { name: "Con precio disponible" }));

    expect(screen.getByTestId("location-search")).toHaveTextContent("q=bitcoin");
    expect(screen.getByTestId("location-search")).toHaveTextContent("priced=1");
    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.queryByText("Ethereum")).not.toBeInTheDocument();
  });
});
