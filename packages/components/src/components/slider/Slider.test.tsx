import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Slider } from "./Slider";

function getRoot(input: HTMLElement) {
  const root = input.closest(".slider");

  if (!root) {
    throw new Error("Slider root was not rendered");
  }

  return root as HTMLElement;
}

describe("Slider", () => {
  test("renders with default DuskMoon classes", () => {
    render(<Slider />);

    const input = screen.getByRole("slider");
    const root = getRoot(input);

    expect(root.className).toContain("slider");
    expect(root.querySelector(".slider-track")).toBeTruthy();
    expect(root.querySelector(".slider-track-filled")).toBeTruthy();
    expect(root.querySelector(".slider-thumb")).toBeTruthy();
  });

  test("uses defaultValue for fill and thumb position", () => {
    render(<Slider defaultValue={30} />);

    const root = getRoot(screen.getByRole("slider"));
    const fill = root.querySelector(".slider-track-filled") as HTMLElement;
    const thumb = root.querySelector(".slider-thumb") as HTMLElement;

    expect(fill.getAttribute("style")).toContain("width: 30%");
    expect(thumb.getAttribute("style")).toContain("left: 30%");
  });

  test("renders range values with two thumbs", () => {
    render(<Slider range defaultValue={[20, 60]} />);

    const inputs = screen.getAllByRole("slider");
    const root = getRoot(inputs[0]);
    const fill = root.querySelector(".slider-track-filled") as HTMLElement;

    expect(root.className).toContain("slider-range");
    expect(inputs).toHaveLength(2);
    expect(root.querySelectorAll(".slider-thumb")).toHaveLength(2);
    expect(fill.getAttribute("style")).toContain("left: 20%");
    expect(fill.getAttribute("style")).toContain("width: 40%");
  });

  test("calls onChange and onAfterChange with changed scalar value", () => {
    let changedValue: unknown;
    let afterValue: unknown;

    render(
      <Slider
        defaultValue={10}
        onChange={(nextValue) => (changedValue = nextValue)}
        onAfterChange={(nextValue) => (afterValue = nextValue)}
      />,
    );

    const input = screen.getByRole("slider");

    fireEvent.change(input, { target: { value: "40" } });
    fireEvent.mouseUp(input);

    expect(changedValue).toBe(40);
    expect(afterValue).toBe(40);
  });

  test("applies disabled and vertical classes", () => {
    render(<Slider disabled vertical />);

    const input = screen.getByRole("slider") as HTMLInputElement;
    const root = getRoot(input);

    expect(root.className).toContain("slider-disabled");
    expect(root.className).toContain("slider-vertical");
    expect(input.disabled).toBe(true);
  });

  test("passes min and max to range inputs", () => {
    render(<Slider min={10} max={80} defaultValue={20} />);

    const input = screen.getByRole("slider") as HTMLInputElement;

    expect(input.min).toBe("10");
    expect(input.max).toBe("80");
  });

  test("renders marks and active mark classes", () => {
    render(
      <Slider
        defaultValue={50}
        marks={{
          0: "Low",
          50: { label: "Mid", className: "custom-mark" },
          100: "High",
        }}
      />,
    );

    const root = getRoot(screen.getByRole("slider"));

    expect(screen.getByText("Low")).toBeTruthy();
    expect(screen.getByText("Mid")).toBeTruthy();
    expect(screen.getByText("High")).toBeTruthy();
    expect(root.querySelectorAll(".slider-mark")).toHaveLength(3);
    expect(root.querySelector(".custom-mark")?.className).toContain(
      "slider-mark-active",
    );
  });

  test("applies custom className", () => {
    render(<Slider className="custom-slider" />);

    expect(getRoot(screen.getByRole("slider")).className).toContain(
      "custom-slider",
    );
  });
});
