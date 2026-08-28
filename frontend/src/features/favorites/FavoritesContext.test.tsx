import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "../../api/client";
import { AuthProvider, useAuth } from "../../auth/AuthContext";
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

function Authenticate() {
  const { login } = useAuth();
  useEffect(() => {
    void login("mateo@example.com", "password123");
  }, [login]);
  return null;
}

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("FavoritesProvider", () => {
  it("carga los favoritos del usuario autenticado con su token", async () => {
    vi.spyOn(api, "login").mockResolvedValue({
      access_token: "access-token",
      token_type: "bearer",
    });
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
        <Authenticate />
        <FavoritesProvider>
          <FavoritesProbe />
        </FavoritesProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("favorites-result")).toHaveTextContent("Bitcoin");
    });
    expect(getCurrentUser).toHaveBeenCalledWith("access-token");
    expect(getFavoriteDetails).toHaveBeenCalledWith(
      7,
      "access-token",
      expect.anything(),
    );
  });
});
