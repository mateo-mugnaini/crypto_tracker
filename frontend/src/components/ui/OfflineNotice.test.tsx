import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import OfflineNotice from "./OfflineNotice";

const onlineDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "onLine");

afterEach(() => {
  if (onlineDescriptor) {
    Object.defineProperty(Navigator.prototype, "onLine", onlineDescriptor);
  }
});

describe("OfflineNotice", () => {
  it("informa cuando se pierde la conexión y desaparece al recuperarla", () => {
    Object.defineProperty(Navigator.prototype, "onLine", {
      configurable: true,
      value: false,
    });
    render(<OfflineNotice />);

    expect(screen.getByRole("alert")).toHaveTextContent("Sin conexión");
    fireEvent(window, new Event("online"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
