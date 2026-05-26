import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Rate } from "./Rate";

describe("Rate", () => {
  test("renders with default classes", () => {
    render(<Rate />);

    const root = screen.getByRole("radiogroup");
    const items = screen.getAllByRole("radio");

    expect(root.className).toContain("rating");
    expect(root.className).toContain("rating-interactive");
    expect(items).toHaveLength(5);
    expect(items[0].className).toContain("rating-item");
  });

  test("supports custom count", () => {
    render(<Rate count={7} />);

    expect(screen.getAllByRole("radio")).toHaveLength(7);
  });

  test("fills items from defaultValue", () => {
    render(<Rate defaultValue={3} />);

    const items = screen.getAllByRole("radio");

    expect(items[0].className).toContain("rating-item-filled");
    expect(items[1].className).toContain("rating-item-filled");
    expect(items[2].className).toContain("rating-item-filled");
    expect(items[3].className).not.toContain("rating-item-filled");
  });

  test("marks the half item when allowHalf is enabled", () => {
    render(<Rate allowHalf defaultValue={2.5} />);

    const items = screen.getAllByRole("radio");

    expect(items[0].className).toContain("rating-item-filled");
    expect(items[1].className).toContain("rating-item-filled");
    expect(items[2].className).toContain("rating-item-half");
    expect(items[2].className).not.toContain("rating-item-filled");
  });

  test("applies disabled class", () => {
    render(<Rate disabled />);

    const root = screen.getByRole("radiogroup");

    expect(root.className).toContain("rating-disabled");
    expect(root.className).not.toContain("rating-interactive");
    expect(root.getAttribute("aria-disabled")).toBe("true");
  });

  test("calls onChange with clicked value", () => {
    let nextValue: number | undefined;

    render(<Rate onChange={(rateValue) => (nextValue = rateValue)} />);

    fireEvent.click(screen.getAllByRole("radio")[2]);

    expect(nextValue).toBe(3);
  });

  test("clears when allowClear is enabled and current value is clicked", () => {
    let nextValue: number | undefined;

    render(
      <Rate
        defaultValue={3}
        onChange={(rateValue) => (nextValue = rateValue)}
      />,
    );

    const items = screen.getAllByRole("radio");
    fireEvent.click(items[2]);

    expect(nextValue).toBe(0);
    expect(items[0].className).not.toContain("rating-item-filled");
    expect(items[1].className).not.toContain("rating-item-filled");
    expect(items[2].className).not.toContain("rating-item-filled");
  });

  test("applies custom className", () => {
    render(<Rate className="custom-rate" />);

    expect(screen.getByRole("radiogroup").className).toContain("custom-rate");
  });
});
