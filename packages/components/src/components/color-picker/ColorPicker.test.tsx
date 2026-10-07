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

  test("forwards native trigger labels and errors while retaining picker actions", () => {
    let ignored = false;
    render(
      <>
        <label htmlFor="brand-color">Brand color</label>
        <ColorPicker
          triggerProps={{
            id: "brand-color",
            "aria-describedby": "color-help",
            "aria-invalid": true,
            type: "submit",
            onClick: () => {
              ignored = true;
            },
          }}
        />
      </>,
    );
    const button = screen.getByLabelText("Brand color") as HTMLButtonElement;
    expect(button.type).toBe("button");
    expect(button.getAttribute("aria-describedby")).toBe("color-help");
    expect(button.getAttribute("aria-invalid")).toBe("true");
    fireEvent.click(button);
    expect(screen.getByLabelText("Color value")).toBeTruthy();
    expect(ignored).toBe(false);
  });
});

describe("ColorPicker visual selection", () => {
  test("selects saturation/brightness with a captured pointer and completes on release", () => {
    const changes: unknown[] = [];
    const completed: unknown[] = [];
    render(
      <ColorPicker
        defaultValue="#ff0000"
        defaultOpen
        onChange={(value) => changes.push(value)}
        onChangeComplete={(value) => completed.push(value)}
      />,
    );
    const area = screen.getByRole("slider", {
      name: "Saturation and brightness",
    });
    area.getBoundingClientRect = () => ({
      left: 10,
      top: 20,
      width: 200,
      height: 100,
      right: 210,
      bottom: 120,
      x: 10,
      y: 20,
      toJSON() {},
    });
    fireEvent.pointerDown(area, {
      pointerId: 1,
      button: 0,
      clientX: 110,
      clientY: 70,
    });
    expect(changes.at(-1)).toBe("#804040");
    expect(completed).toHaveLength(0);
    fireEvent.pointerMove(area, { pointerId: 1, clientX: 210, clientY: 20 });
    fireEvent.pointerUp(area, { pointerId: 1, clientX: 210, clientY: 20 });
    expect(changes.at(-1)).toBe("#ff0000");
    expect(completed).toEqual(["#ff0000"]);
    expect(
      (screen.getByLabelText("Color value") as HTMLInputElement).value,
    ).toBe("#ff0000");
  });

  test("keyboard selection and hue update hex without changing the chosen format", () => {
    render(<ColorPicker defaultValue="#ff0000" defaultOpen />);
    const area = screen.getByRole("slider", {
      name: "Saturation and brightness",
    });
    fireEvent.keyDown(area, { key: "ArrowDown" });
    expect(
      (screen.getByLabelText("Color value") as HTMLInputElement).value,
    ).toBe("#fc0000");
    fireEvent.keyDown(area, { key: "ArrowUp" });
    fireEvent.change(screen.getByRole("slider", { name: "Hue" }), {
      target: { value: "120" },
    });
    expect(
      (screen.getByLabelText("Color value") as HTMLInputElement).value,
    ).toBe("#00ff00");
    expect(
      (screen.getByLabelText("Color format") as HTMLSelectElement).value,
    ).toBe("hex");
  });

  test.each(["rgb", "hsb"] as const)(
    "visual changes preserve controlled %s format, alpha, and callbacks",
    (format) => {
      let changed: unknown;
      let css = "";
      let complete: unknown;
      const initial = { h: 0, s: 100, b: 100, a: 0.5 };
      const { rerender } = render(
        <ColorPicker
          value={initial}
          open
          format={format}
          onChange={(value, valueCss) => {
            changed = value;
            css = valueCss;
          }}
          onChangeComplete={(value) => {
            complete = value;
          }}
        />,
      );
      fireEvent.change(screen.getByRole("slider", { name: "Hue" }), {
        target: { value: "120" },
      });
      expect(changed).toEqual(
        format === "rgb"
          ? { r: 0, g: 255, b: 0, a: 0.5 }
          : { h: 120, s: 100, b: 100, a: 0.5 },
      );
      expect(complete).toEqual(changed);
      expect(css).toBe(
        format === "rgb" ? "rgba(0, 255, 0, 0.5)" : "hsb(120, 100%, 100%)",
      );
      expect(
        (screen.getByRole("slider", { name: "Hue" }) as HTMLInputElement).value,
      ).toBe("0");
      rerender(
        <ColorPicker
          value={changed as Parameters<typeof ColorPicker>[0]["value"]}
          open
          format={format}
        />,
      );
      expect(
        (screen.getByRole("slider", { name: "Hue" }) as HTMLInputElement).value,
      ).toBe("120");
    },
  );

  test("disabled open panels block visual, input, and preset changes", () => {
    let changes = 0;
    render(
      <ColorPicker
        value="#ff0000"
        open
        disabled
        presets={[{ colors: ["#0000ff"] }]}
        onChange={() => changes++}
      />,
    );
    const area = screen.getByRole("slider", {
      name: "Saturation and brightness",
    });
    expect(area.getAttribute("aria-disabled")).toBe("true");
    expect(area.tabIndex).toBe(-1);
    expect(
      (screen.getByRole("slider", { name: "Hue" }) as HTMLInputElement)
        .disabled,
    ).toBe(true);
    fireEvent.keyDown(area, { key: "ArrowDown" });
    fireEvent.pointerDown(area, {
      button: 0,
      pointerId: 1,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.change(screen.getByLabelText("Color value"), {
      target: { value: "#0000ff" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Select color #0000ff" }),
    );
    expect(changes).toBe(0);
  });

  test("invalid hex text stays editable until a graphical selection corrects it", () => {
    render(<ColorPicker defaultValue="#ff0000" defaultOpen />);
    fireEvent.change(screen.getByLabelText("Color value"), {
      target: { value: "#oops" },
    });
    expect(
      (screen.getByLabelText("Color value") as HTMLInputElement).value,
    ).toBe("#oops");
    fireEvent.keyDown(
      screen.getByRole("slider", { name: "Saturation and brightness" }),
      { key: "ArrowUp" },
    );
    expect(
      (screen.getByLabelText("Color value") as HTMLInputElement).value,
    ).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("ColorPicker popup and bounds", () => {
  test("clamps touch/pointer selection outside the plane and ignores unrelated pointer movement", () => {
    let value: unknown;
    render(
      <ColorPicker
        defaultValue="#ff0000"
        defaultOpen
        onChange={(next) => {
          value = next;
        }}
      />,
    );
    const area = screen.getByRole("slider", {
      name: "Saturation and brightness",
    });
    area.getBoundingClientRect = () => ({
      left: 10,
      top: 20,
      width: 200,
      height: 100,
      right: 210,
      bottom: 120,
      x: 10,
      y: 20,
      toJSON() {},
    });
    fireEvent.pointerMove(area, { pointerId: 2, clientX: 500, clientY: -100 });
    expect(value).toBeUndefined();
    fireEvent.pointerDown(area, {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: 110,
      clientY: 70,
    });
    fireEvent.pointerMove(area, { pointerId: 1, clientX: 500, clientY: -100 });
    expect(value).toBe("#ff0000");
    fireEvent.pointerUp(area, { pointerId: 1, clientX: -100, clientY: 500 });
    expect(value).toBe("#000000");
    expect(area.getAttribute("aria-valuetext")).toBe(
      "Saturation 0%, brightness 0%",
    );
  });

  test("Escape returns focus to the labeled trigger and outside pointer closes without losing value", () => {
    const opens: boolean[] = [];
    render(
      <ColorPicker
        defaultValue="#ff0000"
        triggerProps={{ "aria-label": "Brand color" }}
        onOpenChange={(next) => opens.push(next)}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Brand color" });
    fireEvent.click(trigger);
    const hue = screen.getByRole("slider", { name: "Hue" });
    fireEvent.change(hue, { target: { value: "120" } });
    fireEvent.keyDown(hue, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    expect(
      (screen.getByLabelText("Color value") as HTMLInputElement).value,
    ).toBe("#00ff00");
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opens).toEqual([true, false, true, false]);
  });

  test("controlled open remains visible on dismissal until the owner updates", () => {
    const opens: boolean[] = [];
    const { rerender } = render(
      <ColorPicker
        value="#ff0000"
        open
        onOpenChange={(next) => opens.push(next)}
      />,
    );
    fireEvent.keyDown(screen.getByRole("slider", { name: "Hue" }), {
      key: "Escape",
    });
    expect(opens).toEqual([false]);
    expect(screen.getByRole("dialog")).toBeTruthy();
    rerender(<ColorPicker value="#ff0000" open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
