import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../auth/AuthContext";
import { MarketProvider } from "../../features/market/MarketContext";
import Topbar from "./Topbar";
describe("Topbar", () => {
  it("marca la vista activa y expone rutas directas", () => {
    render(
      _jsx(AuthProvider, {
        children: _jsx(MarketProvider, {
          children: _jsx(MemoryRouter, {
            initialEntries: ["/history"],
            children: _jsx(Topbar, {}),
          }),
        }),
      }),
    );
    const historyLinks = screen.getAllByRole("link", { name: /Historial/ });
    expect(historyLinks).toHaveLength(2);
    expect(historyLinks[0]).toHaveAttribute("href", "/history");
    expect(historyLinks[0]).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { name: /Mercado/ })[0]).toHaveAttribute(
      "href",
      "/market",
    );
  });
});
