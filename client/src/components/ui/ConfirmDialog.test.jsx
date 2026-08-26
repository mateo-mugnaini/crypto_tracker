import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./ConfirmDialog";
describe("ConfirmDialog", () => {
  it("confirma una acción y permite cancelarla", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      _jsx(ConfirmDialog, {
        description: "Se borrar\u00E1 la posici\u00F3n.",
        onCancel: onCancel,
        onConfirm: onConfirm,
        open: true,
        title: "\u00BFEliminar posici\u00F3n?",
      }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });
  it("se cierra con Escape", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      _jsx(ConfirmDialog, {
        description: "Se borrar\u00E1 la posici\u00F3n.",
        onCancel: onCancel,
        onConfirm: vi.fn(),
        open: true,
        title: "\u00BFEliminar posici\u00F3n?",
      }),
    );
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
  });
  it("mantiene el foco dentro del diálogo y lo devuelve al control de origen", async () => {
    const user = userEvent.setup();
    const trigger = document.createElement("button");
    trigger.textContent = "Abrir";
    document.body.append(trigger);
    trigger.focus();
    const view = render(
      _jsx(ConfirmDialog, {
        description: "Se borrar\u00C3\u00A1 la posici\u00C3\u00B3n.",
        onCancel: vi.fn(),
        onConfirm: vi.fn(),
        open: true,
        title: "\u00C2\u00BFEliminar posici\u00C3\u00B3n?",
      }),
    );
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    view.rerender(
      _jsx(ConfirmDialog, {
        description: "Se borrar\u00C3\u00A1 la posici\u00C3\u00B3n.",
        onCancel: vi.fn(),
        onConfirm: vi.fn(),
        open: false,
        title: "\u00C2\u00BFEliminar posici\u00C3\u00B3n?",
      }),
    );
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
