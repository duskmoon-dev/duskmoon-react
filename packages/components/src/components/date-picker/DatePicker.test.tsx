import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  test("renders one complete decorative calendar SVG inside the accessible dropdown trigger", () => {
    const { rerender } = render(<DatePicker />);
    const trigger = screen.getByRole("button", {
      name: "Open date picker",
      exact: true,
    });
    const icon = trigger.querySelector("svg")!;
    expect(icon).toBeTruthy();
    expect(trigger.querySelectorAll("svg")).toHaveLength(1);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("focusable")).toBe("false");
    expect(icon.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(icon.getAttribute("stroke")).toBe("currentColor");
    expect(icon.querySelector("rect")).toBeTruthy();
    expect(icon.querySelector("path")).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Choose date" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);
    rerender(<DatePicker disabled />);
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("year drilldown preserves controlled value and open state", () => {
    const changes: string[] = [];
    render(
      <DatePicker
        value="2026-05-25"
        open
        onChange={(value) => changes.push(value ?? "")}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Year" }));
    fireEvent.click(screen.getByRole("button", { name: "2026-08-01" }));
    expect(changes).toEqual([]);
    expect(screen.getByDisplayValue("2026-05-25")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "2026-08-16" }));
    expect(changes).toEqual(["2026-08-16"]);
    expect(screen.getByDisplayValue("2026-05-25")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  test("browses year and month without committing until an enabled day is selected", () => {
    const changes: string[] = [];
    const { container } = render(
      <DatePicker
        defaultValue="2026-05-25"
        defaultOpen
        disabledDate={(date) => date === "2027-08-01" || date === "2027-08-15"}
        onChange={(value) => changes.push(value ?? "")}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Year" }));
    expect(container.querySelector(".calendar-month-grid")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Year" }).getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Next panel" }));
    expect(screen.getByText("2027", { exact: true })).toBeTruthy();
    const month = screen.getByRole("button", { name: "2027-08-01" });
    expect((month as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(month);
    expect(changes).toEqual([]);
    expect(screen.getByDisplayValue("2026-05-25")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(container.querySelector(".calendar-date-grid")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "2027-08-15" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "2027-08-16" }));
    expect(changes).toEqual(["2027-08-16"]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("month picker still commits a month string and closes", () => {
    let changed = "";
    render(
      <DatePicker.MonthPicker
        defaultValue="2026-05"
        defaultOpen
        onChange={(value) => {
          changed = value ?? "";
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "2026-08-01" }));
    expect(changed).toBe("2026-08");
    expect(screen.getByDisplayValue("2026-08")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("opens a default calendar by icon or input and commits an enabled date", () => {
    let changed = "";
    render(
      <DatePicker
        defaultValue="2026-05-25"
        disabledDate={(date) => date === "2026-05-26"}
        onChange={(value) => {
          changed = value ?? "";
        }}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open date picker" });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Choose date" });
    expect(dialog).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "2026-05-26" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    const day = screen.getByRole("button", { name: "2026-05-27" });
    fireEvent.blur(screen.getByPlaceholderText("Select date"), {
      relatedTarget: day,
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(day);
    expect(changed).toBe("2026-05-27");
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByPlaceholderText("Select date"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("honors controlled open and disabled states", () => {
    const changes: boolean[] = [];
    const { rerender } = render(
      <DatePicker open={false} onOpenChange={(open) => changes.push(open)} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open date picker" }));
    expect(changes).toEqual([true]);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<DatePicker disabled defaultOpen />);
    expect(
      (
        screen.getByRole("button", {
          name: "Open date picker",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

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
    fireEvent.click(screen.getByRole("button", { name: "Open date picker" }));
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

  test("forwards native input labels and errors without overriding controlled behavior", () => {
    let changed: unknown;
    let ignored = false;
    render(
      <>
        <label htmlFor="due">Due date</label>
        <DatePicker
          value="2026-05-25"
          inputProps={{
            id: "due",
            "aria-describedby": "due-help",
            "aria-invalid": true,
            type: "text",
            value: "wrong",
            onChange: () => {
              ignored = true;
            },
          }}
          onChange={(value) => {
            changed = value;
          }}
        />
      </>,
    );
    const input = screen.getByLabelText("Due date") as HTMLInputElement;
    expect(input.type).toBe("date");
    expect(input.value).toBe("2026-05-25");
    expect(input.getAttribute("aria-describedby")).toBe("due-help");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(input, { target: { value: "2026-06-01" } });
    expect(changed).toBe("2026-06-01");
    expect(ignored).toBe(false);
  });

  test("range inputs inherit attributes with distinct native ids", () => {
    render(
      <DatePicker.RangePicker
        inputProps={{ id: "dates", "aria-describedby": "date-range-help" }}
      />,
    );
    expect(document.getElementById("dates")?.tagName).toBe("INPUT");
    expect(
      document.getElementById("dates-end")?.getAttribute("aria-describedby"),
    ).toBe("date-range-help");
  });
});
