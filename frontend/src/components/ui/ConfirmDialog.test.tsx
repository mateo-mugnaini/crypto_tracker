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
      <ConfirmDialog
        description="Se borrará la posición."
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        title="¿Eliminar posición?"
      />,
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
      <ConfirmDialog
        description="Se borrará la posición."
        onCancel={onCancel}
        onConfirm={vi.fn()}
        open
        title="¿Eliminar posición?"
      />,
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
      <ConfirmDialog
        description="Se borrarÃ¡ la posiciÃ³n."
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open
        title="Â¿Eliminar posiciÃ³n?"
      />,
    );

    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();

    view.rerender(
      <ConfirmDialog
        description="Se borrarÃ¡ la posiciÃ³n."
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open={false}
        title="Â¿Eliminar posiciÃ³n?"
      />,
    );
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
