import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button";
describe("Button", () => {
  it("expone el estado de carga y bloquea la interacción", () => {
    render(_jsx(Button, { loading: true, onClick: vi.fn(), children: "Guardar" }));
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
  it("ejecuta la acción cuando está habilitado", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(_jsx(Button, { onClick: onClick, children: "Actualizar" }));
    await user.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
