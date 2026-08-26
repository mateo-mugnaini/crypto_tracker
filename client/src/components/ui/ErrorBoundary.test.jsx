import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";
function BrokenView() {
  throw new Error("detalle interno que no debe mostrarse");
}
describe("ErrorBoundary", () => {
  it("muestra una recuperación segura sin exponer el detalle interno", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(_jsx(ErrorBoundary, { children: _jsx(BrokenView, {}) }));
    expect(screen.getByRole("alert")).toHaveTextContent("Algo salió mal");
    expect(screen.getByRole("alert")).not.toHaveTextContent("detalle interno");
    consoleError.mockRestore();
  });
});
