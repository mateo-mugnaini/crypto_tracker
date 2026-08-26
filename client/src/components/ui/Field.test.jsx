import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Field from "./Field";
describe("Field", () => {
  it("asocia el control con la ayuda y marca el error para lectores de pantalla", () => {
    render(
      _jsx(Field, {
        error: "El precio no es v\u00E1lido.",
        hint: "Usa USD.",
        id: "price",
        label: "Precio",
        children: _jsx("input", { id: "price" }),
      }),
    );
    expect(screen.getByLabelText("Precio")).toHaveAttribute(
      "aria-describedby",
      "price-error",
    );
    expect(screen.getByLabelText("Precio")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("El precio no es válido.");
  });
});
