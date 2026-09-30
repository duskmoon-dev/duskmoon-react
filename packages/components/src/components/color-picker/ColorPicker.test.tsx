import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { ColorPicker } from "./ColorPicker";

describe("ColorPicker", () => {
  test("renders value, size, format, and text", () => {
    const { container } = render(
      <ColorPicker
        value="#ff0000"
        size="large"
        showText
        format="hex"
        className="custom-color"
      />,
    );

    const root = container.querySelector(".color-picker") as HTMLElement;

    expect(root.className).toContain("custom-color");
    expect(root.className).toContain("color-picker-lg");
    expect(root.className).toContain("color-picker-format-hex");
    expect(screen.getByLabelText("Color format").className).toContain(
      "color-picker-format-select",
    );
    expect(screen.getByText("#ff0000")).toBeTruthy();
  });

  test("supports uncontrolled open and input changes", () => {
    let changedCss = "";

    render(
      <ColorPicker
        defaultValue="#000000"
        defaultOpen
        onChange={(_value, css) => {
          changedCss = css;
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Color value"), {
      target: { value: "#00ff00" },
    });

    expect(changedCss).toBe("#00ff00");
    expect(
      (screen.getByLabelText("Color value") as HTMLInputElement).value,
    ).toBe("#00ff00");
  });

  test("supports presets and showText render function", () => {
    const changes: string[] = [];

    render(
      <ColorPicker
        defaultOpen
        format="rgb"
        showText={(color) => `Color: ${color}`}
        presets={[{ label: "Brand", colors: ["#0000ff"] }]}
        onChange={(_value, css) => changes.push(css)}
      />,
    );

    expect(screen.getByText(/Color:/)).toBeTruthy();
    expect(screen.getByText("Brand")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Select color/ }));

    expect(changes.at(-1)).toBe("rgb(0, 0, 255)");
  });

  test("supports format changes and hover trigger", () => {
    const formats: string[] = [];
    const { container } = render(
      <ColorPicker
        trigger="hover"
        onFormatChange={(format) => formats.push(format)}
      />,
    );

    const root = container.querySelector(".color-picker") as HTMLElement;
    fireEvent.mouseEnter(root);
    const panel = screen
      .getByLabelText("Color value")
      .closest(".color-picker-panel");
    expect(panel?.className).toContain("popover-bottom");

    fireEvent.change(screen.getByLabelText("Color format"), {
      target: { value: "rgb" },
    });

    expect(formats).toEqual(["rgb"]);
  });

  test("respects disabled state", () => {
    render(<ColorPicker disabled />);

    fireEvent.click(screen.getByRole("button", { name: "Open color picker" }));

    expect(screen.queryByLabelText("Color value")).toBeNull();
  });

  test("has package stylesheet selectors for local color picker classes", async () => {
    const css = await Bun.file(
      new URL("../../styles.css", import.meta.url),
    ).text();

    expect(css).toContain(".color-picker");
    expect(css).toContain(".color-picker-swatch");
    expect(css).toContain(".color-picker-format-select");
    expect(css).toContain(".color-picker .color-picker-panel");
  });
});
