import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
  test("opens default time columns without Now and selects a complete local time", () => {
    let changed = "";
    render(
      <TimePicker
        defaultValue="09:15:20"
        showNow={false}
        onChange={(_, text) => {
          changed = text;
        }}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open time picker" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Choose time" })).toBeTruthy();
    const hour = screen.getByRole("option", { name: "Hour 10" });
    fireEvent.blur(screen.getByPlaceholderText("Select time"), {
      relatedTarget: hour,
    });
    fireEvent.click(hour);
    fireEvent.click(screen.getByRole("option", { name: "Minute 30" }));
    fireEvent.click(screen.getByRole("option", { name: "Second 45" }));
    expect(changed).toBe("10:30:45");
    expect(screen.getByDisplayValue("10:30:45")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByPlaceholderText("Select time"));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("disables panel choices and honors controlled open", () => {
    const changes: boolean[] = [];
    const { rerender } = render(
      <TimePicker open={false} onOpenChange={(open) => changes.push(open)} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open time picker" }));
    expect(changes).toEqual([true]);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(
      <TimePicker open disabledTime={() => ({ disabledHours: () => [13] })} />,
    );
    expect(
      (screen.getByRole("option", { name: "Hour 13" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    rerender(<TimePicker open disabled />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

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

  test("keeps controlled partial time text editable and forwards native input attributes", () => {
    let changed: unknown;
    let formatted = "initial";
    let ignored = false;
    function ControlledTime() {
      const [value, setValue] = React.useState<string | Date | undefined>("");
      return (
        <TimePicker
          value={value}
          inputProps={{
            id: "clock",
            "aria-label": "Meeting time",
            "aria-invalid": true,
            value: "wrong",
            onChange: () => {
              ignored = true;
            },
          }}
          onChange={(next, text) => {
            changed = next;
            formatted = text;
            setValue(next ?? "");
          }}
        />
      );
    }
    render(<ControlledTime />);
    const input = screen.getByRole("textbox", {
      name: "Meeting time",
    }) as HTMLInputElement;
    expect(input.id).toBe("clock");
    expect(input.type).toBe("text");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    for (const value of ["1", "12", "12:", "12:3"]) {
      fireEvent.change(input, { target: { value } });
      expect(input.value).toBe(value);
      expect(changed).toBe(value);
      expect(formatted).toBe("");
    }
    fireEvent.change(input, { target: { value: "12:30:05" } });
    expect(input.value).toBe("12:30:05");
    expect(formatted).toBe("12:30:05");
    expect(ignored).toBe(false);
  });
});
