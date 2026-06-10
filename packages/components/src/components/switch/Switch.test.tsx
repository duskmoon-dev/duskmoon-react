import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Switch } from "./Switch";

describe("Switch", () => {
  test("renders with default classes", () => {
    render(<Switch />);

    const input = screen.getByRole("switch") as HTMLInputElement;
    const root = input.closest("label");
    const track = root?.querySelector(".switch-track");
    const thumb = root?.querySelector(".switch-thumb");

    expect(root?.className).toContain("switch");
    expect(input.className).toContain("switch-input");
    expect(track?.className).toContain("switch-track");
    expect(track?.className).toContain("switch-primary");
    expect(thumb?.className).toContain("switch-thumb");
  });

  test("supports controlled checked state", () => {
    render(<Switch checked />);

    const input = screen.getByRole("switch") as HTMLInputElement;

    expect(input.checked).toBe(true);
    expect(input.getAttribute("aria-checked")).toBe("true");
  });

  test("calls onChange with the next checked boolean", () => {
    let nextChecked: boolean | undefined;
    let eventType: string | undefined;

    render(
      <Switch
        onChange={(checked, event) => {
          nextChecked = checked;
          eventType = event.type;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("switch"));

    expect(nextChecked).toBe(true);
    expect(eventType).toBe("change");
  });

  test("loading disables input and applies loading class", () => {
    render(<Switch loading />);

    const input = screen.getByRole("switch") as HTMLInputElement;
    const root = input.closest("label");

    expect(input.disabled).toBe(true);
    expect(input.getAttribute("aria-busy")).toBe("true");
    expect(root?.className).toContain("switch-loading");
  });

  test("applies size and color classes", () => {
    render(<Switch size="lg" color="tertiary" />);

    const input = screen.getByRole("switch") as HTMLInputElement;
    const root = input.closest("label");
    const track = root?.querySelector(".switch-track");

    expect(root?.className).toContain("switch-lg");
    expect(track?.className).toContain("switch-tertiary");
  });

  test("renders checked and unchecked children", () => {
    const { rerender } = render(
      <Switch checked checkedChildren="On" unCheckedChildren="Off" />,
    );

    expect(screen.getByText("On")).toBeTruthy();

    rerender(
      <Switch checked={false} checkedChildren="On" unCheckedChildren="Off" />,
    );

    expect(screen.getByText("Off")).toBeTruthy();
  });
});
