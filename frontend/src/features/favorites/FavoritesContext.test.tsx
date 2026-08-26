import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "../../api/client";
import { AuthProvider } from "../../auth/AuthContext";
import { FavoritesProvider, useFavorites } from "./FavoritesContext";

const favorite = {
  coin_id: "bitcoin",
  market_cap_rank: 1,
  name: "Bitcoin",
  symbol: "btc",
};

function FavoritesProbe() {
  const { favorites } = useFavorites();
  return (
    <output data-testid="favorites-result">{favorites[0]?.name || "loading"}</output>
  );
}

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("FavoritesProvider", () => {
  it("carga los favoritos del usuario autenticado con su token", async () => {
    sessionStorage.setItem("crypto_tracker_access_token", "access-token");
    const getCurrentUser = vi.spyOn(api, "getCurrentUser").mockResolvedValue({
      created_at: "2026-01-01T00:00:00Z",
      email: "mateo@example.com",
      id: 7,
      username: "mateo",
    });
    const getFavoriteDetails = vi
      .spyOn(api, "getFavoriteDetails")
      .mockResolvedValue({ data: [favorite], success: true });

    render(
      <AuthProvider>
        <FavoritesProvider>
          <FavoritesProbe />
        </FavoritesProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("favorites-result")).toHaveTextContent("Bitcoin");
    });
    expect(getCurrentUser).toHaveBeenCalledWith("access-token", expect.anything());
    expect(getFavoriteDetails).toHaveBeenCalledWith(
      7,
      "access-token",
      expect.anything(),
    );
  });
});
