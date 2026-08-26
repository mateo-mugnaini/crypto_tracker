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
});
