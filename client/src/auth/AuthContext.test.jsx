import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/client";
import LoginForm from "../components/auth/LoginForm";
import { AuthProvider, useAuth } from "./AuthContext";
const user = {
  created_at: "2026-01-01T00:00:00Z",
  email: "mateo@example.com",
  id: 1,
  username: "mateo",
};
function AuthStatus() {
  const { status } = useAuth();
  return _jsx("output", { "data-testid": "auth-status", children: status });
}
afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});
describe("AuthProvider", () => {
  it("inicia sesión, persiste el token y carga el usuario actual", async () => {
    vi.spyOn(api, "login").mockResolvedValue({
      access_token: "access-token",
      token_type: "bearer",
    });
    vi.spyOn(api, "getCurrentUser").mockResolvedValue(user);
    const onRegister = vi.fn();
    const client = userEvent.setup();
    render(
      _jsxs(AuthProvider, {
        children: [_jsx(AuthStatus, {}), _jsx(LoginForm, { onRegister: onRegister })],
      }),
    );
    await client.type(screen.getByLabelText("Email"), "mateo@example.com");
    await client.type(screen.getByLabelText("Contraseña"), "password123");
    await client.click(screen.getByRole("button", { name: "Ingresar" }));
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
    });
    expect(sessionStorage.getItem("crypto_tracker_access_token")).toBe("access-token");
    expect(onRegister).not.toHaveBeenCalled();
  });
});
