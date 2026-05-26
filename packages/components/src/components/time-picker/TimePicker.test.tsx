import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
  test("renders value with format, size, status, and classes", () => {
    const { container } = render(
      <TimePicker
        value="13:05:09"
        format="HH:mm"
        size="lg"
        status="error"
        className="custom-time"
      />,
    );

    const root = container.querySelector(".time-picker") as HTMLElement;

    expect(root.className).toContain("custom-time");
    expect(root.className).toContain("time-picker-lg");
    expect(root.className).toContain("time-picker-error");
    expect(screen.getByDisplayValue("13:05")).toBeTruthy();
  });

  test("supports uncontrolled changes and clear", () => {
    let changedValue = "12:00:00";
    let changedString = "12:00:00";

    render(
      <TimePicker
        allowClear
        defaultValue="12:00:00"
        onChange={(value, timeString) => {
          changedValue = String(value ?? "");
          changedString = timeString;
        }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Clear time"));

    expect(changedValue).toBe("");
    expect(changedString).toBe("");
  });

  test("supports showNow while open", () => {
    let changedString = "";

    render(
      <TimePicker
        defaultOpen
        onChange={(_, timeString) => {
          changedString = timeString;
        }}
      />,
    );

    fireEvent.focus(screen.getByPlaceholderText("Select time"));
    fireEvent.click(screen.getByRole("button", { name: "Now" }));

    expect(changedString).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  test("supports 12-hour display values", () => {
    render(<TimePicker use12Hours value="13:05:00" format="h:mm A" />);

    expect(screen.getByDisplayValue("1:05 PM")).toBeTruthy();
  });

  test("blocks disabled time values", () => {
    let changedString = "";

    render(
      <TimePicker
        disabledTime={() => ({
          disabledHours: () => [13],
          disabledMinutes: () => [30],
        })}
        onChange={(_, timeString) => {
          changedString = timeString;
        }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Select time"), {
      target: { value: "13:15:00" },
    });
    expect(changedString).toBe("");

    fireEvent.change(screen.getByPlaceholderText("Select time"), {
      target: { value: "12:30:00" },
    });
    expect(changedString).toBe("");

    fireEvent.change(screen.getByPlaceholderText("Select time"), {
      target: { value: "12:15:00" },
    });
    expect(changedString).toBe("12:15:00");
  });

  test("supports range picker values", () => {
    let changedValue: [string | Date | undefined, string | Date | undefined] = [
      undefined,
      undefined,
    ];
    let changedStrings: [string, string] = ["", ""];

    render(
      <TimePicker.RangePicker
        onChange={(value, timeStrings) => {
          changedValue = value;
          changedStrings = timeStrings;
        }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Start time"), {
      target: { value: "09:00:00" },
    });
    fireEvent.change(screen.getByPlaceholderText("End time"), {
      target: { value: "18:30:00" },
    });

    expect(changedValue).toEqual(["09:00:00", "18:30:00"]);
    expect(changedStrings).toEqual(["09:00:00", "18:30:00"]);
  });
});
