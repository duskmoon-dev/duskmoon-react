import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Swap, SwapButton } from "./Swap";

describe("Swap", () => {
  test("uses the native checkbox and Core slot order", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Swap
        ref={ref}
        aria-label="Toggle navigation"
        off="Menu"
        on="Close"
        rotate
      />,
    );

    const input = screen.getByRole("checkbox", {
      name: "Toggle navigation",
    }) as HTMLInputElement;
    const root = input.closest("label") as HTMLLabelElement;
    expect(ref.current).toBe(input);
    expect(root.className).toContain("swap-rotate");
    expect(input.className).toBe("swap-input");
    expect(input.nextElementSibling?.className).toBe("swap-off");
    expect(input.nextElementSibling?.nextElementSibling?.className).toBe(
      "swap-on",
    );
    fireEvent.click(input);
    expect(input.checked).toBe(true);
  });

  test("respects native checked and disabled attributes", () => {
    render(
      <Swap aria-label="Toggle" off="Off" on="On" defaultChecked disabled />,
    );
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(input.disabled).toBe(true);
  });
});

describe("SwapButton", () => {
  test("exposes application-owned pressed state and a native button", () => {
    const ref = createRef<HTMLButtonElement>();
    let clicks = 0;
    const { rerender } = render(
      <SwapButton
        ref={ref}
        aria-label="Mute"
        off="Sound on"
        on="Muted"
        pressed={false}
        onClick={() => clicks++}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Mute",
    }) as HTMLButtonElement;
    expect(ref.current).toBe(button);
    expect(button.type).toBe("button");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(button);
    expect(clicks).toBe(1);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    rerender(
      <SwapButton aria-label="Mute" off="Sound on" on="Muted" pressed />,
    );
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });
});
