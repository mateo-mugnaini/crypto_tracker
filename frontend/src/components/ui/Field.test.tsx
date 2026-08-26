import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Field from "./Field";

describe("Field", () => {
  it("asocia el control con la ayuda y marca el error para lectores de pantalla", () => {
    render(
      <Field error="El precio no es válido." hint="Usa USD." id="price" label="Precio">
        <input id="price" />
      </Field>,
    );

    expect(screen.getByLabelText("Precio")).toHaveAttribute(
      "aria-describedby",
      "price-error",
    );
    expect(screen.getByLabelText("Precio")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("El precio no es válido.");
  });
});
