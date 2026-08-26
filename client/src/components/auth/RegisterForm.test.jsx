import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../../api/client";
import RegisterForm from "./RegisterForm";
afterEach(() => {
  vi.restoreAllMocks();
});
describe("RegisterForm", () => {
  it("bloquea el registro cuando las contraseñas no coinciden", async () => {
    const register = vi.spyOn(api, "register");
    const client = userEvent.setup();
    render(_jsx(RegisterForm, { onLogin: vi.fn(), onRegistered: vi.fn() }));
    await client.type(screen.getByLabelText("Usuario"), "mateo");
    await client.type(screen.getByLabelText("Email"), "mateo@example.com");
    await client.type(
      screen.getByLabelText("Contraseña", { exact: true }),
      "password123",
    );
    await client.type(screen.getByLabelText("Repetir contraseña"), "different123");
    await client.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });
});
