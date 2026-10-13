import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

  test.each(["controlled", "uncontrolled"])(
    "readOnly prevents %s changes while keeping the input focusable",
    (mode) => {
      const changedValues: Array<number | null> = [];
      const steppedValues: Array<number | null> = [];
      const keys: string[] = [];

      render(
        <InputNumber
          {...(mode === "controlled" ? { value: 2 } : { defaultValue: 2 })}
          readOnly
          onChange={(value) => changedValues.push(value)}
          onStep={(value) => steppedValues.push(value)}
          onKeyDown={(event) => keys.push(event.key)}
        />,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const increase = screen.getByRole("button", {
        name: "Increase value",
      }) as HTMLButtonElement;
      const decrease = screen.getByRole("button", {
        name: "Decrease value",
      }) as HTMLButtonElement;

      expect(input.readOnly).toBe(true);
      expect(input.disabled).toBe(false);
      input.focus();
      expect(document.activeElement).toBe(input);
      expect(increase.disabled).toBe(true);
      expect(decrease.disabled).toBe(true);

      fireEvent.click(increase);
      fireEvent.click(decrease);
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.change(input, { target: { value: "3" } });

      expect(changedValues).toEqual([]);
      expect(steppedValues).toEqual([]);
      expect(keys).toEqual(["ArrowUp", "ArrowDown"]);
      expect(input.value).toBe("2");
    },
  );

  test("includes component stylesheet rules", () => {
    const styles = readFileSync(join(import.meta.dir, "../../styles.css"), {
      encoding: "utf8",
    });

    expect(styles).toContain(".input-number");
    expect(styles).toContain(".input-number-input");
    expect(styles).toContain(".input-number-controls");
    expect(styles).toContain(".input-number-control");
  });
});
