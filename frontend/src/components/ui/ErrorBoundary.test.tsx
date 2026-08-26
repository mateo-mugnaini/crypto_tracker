import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import ErrorBoundary from "./ErrorBoundary";

function BrokenView(): ReactNode {
  throw new Error("detalle interno que no debe mostrarse");
}

describe("ErrorBoundary", () => {
  it("muestra una recuperación segura sin exponer el detalle interno", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <BrokenView />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Algo salió mal");
    expect(screen.getByRole("alert")).not.toHaveTextContent("detalle interno");
    consoleError.mockRestore();
  });
});
