import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
  test("renders controlled value with fullscreen and custom classes", () => {
    const { container } = render(
      <Calendar
        value="2026-05-25"
        fullscreen={false}
        className="custom-calendar"
      />,
    );

    const root = container.querySelector(".calendar") as HTMLElement;

    expect(root.className).toContain("custom-calendar");
    expect(root.className).toContain("calendar-card");
    expect(
      screen.getByRole("button", { name: "2026-05-25" }).className,
    ).toContain("calendar-cell-selected");
  });

  test("supports uncontrolled selection callbacks", () => {
    let selected = "";
    let changed = "";

    render(
      <Calendar
        defaultValue="2026-05-01"
        onSelect={(date, info) => {
          selected = `${info.source}:${date}`;
        }}
        onChange={(date) => {
          changed = date;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2026-05-25" }));

    expect(selected).toBe("date:2026-05-25");
    expect(changed).toBe("2026-05-25");
  });

  test("renders date cell content and full cell overrides", () => {
    render(
      <Calendar
        defaultValue="2026-05-01"
        dateCellRender={(date) =>
          date === "2026-05-25" ? <span>Release</span> : null
        }
        cellRender={(date, info) =>
          date === "2026-05-26" ? <strong>Custom day</strong> : info.originNode
        }
      />,
    );

    expect(screen.getByText("Release")).toBeTruthy();
    expect(screen.getByText("Custom day")).toBeTruthy();
  });

  test("supports month mode and month cell render", () => {
    let changed = "";

    render(
      <Calendar
        defaultValue="2026-05-25"
        defaultMode="year"
        monthCellRender={(date) =>
          date === "2026-08-01" ? <span>Quarter close</span> : null
        }
        onChange={(date) => {
          changed = date;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2026-08-01" }));

    expect(screen.getByText("Quarter close")).toBeTruthy();
    expect(changed).toBe("2026-08-01");
  });

  test("emits panel changes for navigation and mode changes", () => {
    const calls: string[] = [];

    render(
      <Calendar
        defaultValue="2026-05-25"
        onPanelChange={(date, mode) => calls.push(`${mode}:${date}`)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next panel" }));
    fireEvent.click(screen.getByRole("button", { name: "Year" }));

    expect(calls).toEqual(["month:2026-06-01", "year:2026-06-01"]);
  });

  test("blocks disabled and out-of-range dates", () => {
    let changed = "";

    render(
      <Calendar
        defaultValue="2026-05-01"
        validRange={["2026-05-10", "2026-05-31"]}
        disabledDate={(date) => date === "2026-05-25"}
        onChange={(date) => {
          changed = date;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2026-05-25" }));
    fireEvent.click(screen.getByRole("button", { name: "2026-05-05" }));

    expect(changed).toBe("");
  });
});
