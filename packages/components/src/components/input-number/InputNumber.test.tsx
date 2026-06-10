import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { InputNumber } from "./InputNumber";

describe("InputNumber", () => {
  test("renders value, status, size, and classes", () => {
    const { container } = render(
      <InputNumber value={3} size="lg" status="error" className="custom" />,
    );

    const root = container.querySelector(".input-number") as HTMLElement;
    const input = screen.getByDisplayValue("3") as HTMLInputElement;

    expect(root.className).toContain("custom");
    expect(root.className).toContain("input-number-lg");
    expect(root.className).toContain("input-number-error");
    expect(input.value).toBe("3");
  });

  test("supports uncontrolled changes with parser and precision", () => {
    const changedValues: Array<number | null> = [];

    render(
      <InputNumber
        defaultValue={1}
        precision={1}
        parser={(value) => Number(value.replace("$", ""))}
        onChange={(value) => {
          changedValues.push(value);
        }}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("1"), {
      target: { value: "$2.26" },
    });

    expect(changedValues.at(-1)).toBe(2.3);
  });

  test("supports min/max and controls", () => {
    const changedValues: Array<number | null> = [];

    render(
      <InputNumber
        defaultValue={1}
        min={0}
        max={2}
        onChange={(value) => {
          changedValues.push(value);
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Increase value" }));
    fireEvent.click(screen.getByRole("button", { name: "Increase value" }));

    expect(changedValues.at(-1)).toBe(2);
  });

  test("supports keyboard stepping and onStep", () => {
    let stepType = "";

    render(
      <InputNumber
        defaultValue={1}
        step={2}
        onStep={(_, info) => {
          stepType = info.type;
        }}
      />,
    );

    fireEvent.keyDown(screen.getByDisplayValue("1"), { key: "ArrowUp" });

    expect(screen.getByDisplayValue("3")).toBeTruthy();
    expect(stepType).toBe("up");
  });

  test("can hide controls and disable keyboard", () => {
    render(<InputNumber defaultValue={1} controls={false} keyboard={false} />);

    expect(screen.queryByRole("button", { name: "Increase value" })).toBeNull();
    fireEvent.keyDown(screen.getByDisplayValue("1"), { key: "ArrowUp" });
    expect(screen.getByDisplayValue("1")).toBeTruthy();
  });
});
