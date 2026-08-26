import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import HelpTag from "./HelpTag";

describe("HelpTag", () => {
  it("expone la ayuda con teclado y permite cerrarla con Escape", async () => {
    const user = userEvent.setup();

    render(
      <HelpTag title="Cómo funciona">
        <span>Texto explicativo</span>
      </HelpTag>,
    );

    const trigger = screen.getByRole("button", { name: "Cómo funciona" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Texto explicativo");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
