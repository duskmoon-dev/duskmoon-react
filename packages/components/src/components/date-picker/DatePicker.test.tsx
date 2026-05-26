import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  test("renders picker input with value, size, status, and classes", () => {
    const { container } = render(
      <DatePicker
        value="2026-05-25"
        size="lg"
        status="error"
        className="custom-picker"
      />,
    );

    const root = container.querySelector(".datepicker") as HTMLElement;
    const input = screen.getByDisplayValue("2026-05-25") as HTMLInputElement;

    expect(root.className).toContain("custom-picker");
    expect(root.className).toContain("datepicker-lg");
    expect(root.className).toContain("datepicker-error");
    expect(input.type).toBe("date");
  });

  test("supports uncontrolled changes and clear", () => {
    let changedValue = "2026-05-25";

    render(
      <DatePicker
        allowClear
        defaultValue="2026-05-25"
        onChange={(value) => {
          changedValue = value ?? "";
        }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Clear date"));

    expect(changedValue).toBe("");
  });

  test("supports presets and showNow", () => {
    let changedValue = "";

    render(
      <DatePicker
        defaultOpen
        presets={[{ label: "Release", value: "2026-05-25" }]}
        showNow
        onChange={(value) => {
          changedValue = value ?? "";
        }}
      />,
    );

    fireEvent.focus(screen.getByPlaceholderText("Select date"));
    fireEvent.click(screen.getByRole("button", { name: "Release" }));

    expect(changedValue).toBe("2026-05-25");
    expect(screen.getByRole("button", { name: "Now" })).toBeTruthy();
  });

  test("blocks disabledDate values", () => {
    let changedValue = "";

    render(
      <DatePicker
        disabledDate={(value) => value === "2026-05-25"}
        onChange={(value) => {
          changedValue = value ?? "";
        }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Select date"), {
      target: { value: "2026-05-25" },
    });

    expect(changedValue).toBe("");
  });

  test("supports range picker values", () => {
    let changedValue: [string | undefined, string | undefined] = [
      undefined,
      undefined,
    ];

    render(
      <DatePicker.RangePicker
        onChange={(value) => {
          changedValue = value;
        }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Start date"), {
      target: { value: "2026-05-01" },
    });
    fireEvent.change(screen.getByPlaceholderText("End date"), {
      target: { value: "2026-05-25" },
    });

    expect(changedValue).toEqual(["2026-05-01", "2026-05-25"]);
  });

  test("exposes static picker aliases", () => {
    render(
      <>
        <DatePicker.MonthPicker />
        <DatePicker.YearPicker />
      </>,
    );

    expect(screen.getByPlaceholderText("Select month")).toBeTruthy();
    expect(screen.getByPlaceholderText("Select year")).toBeTruthy();
  });
});
