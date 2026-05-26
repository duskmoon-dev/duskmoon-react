import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { getDmDatePickerLocale } from "../../infrastructure";
import { DmDatePicker, setDmDatePickerLocale } from "./DmDatePicker";

describe("DmDatePicker", () => {
  test("renders Dm wrapper class and default date picker", () => {
    const { container } = render(<DmDatePicker defaultValue="2026-05-25" />);

    expect(container.querySelector(".dm-date-picker")).toBeTruthy();
    expect(screen.getByDisplayValue("2026-05-25")).toBeTruthy();
  });

  test("supports locale setter and picker shortcuts", () => {
    setDmDatePickerLocale("zh");
    render(<DmDatePicker.MonthPicker />);

    expect(getDmDatePickerLocale()).toBe("zh");
    expect(screen.getByPlaceholderText("请选择月份")).toBeTruthy();

    setDmDatePickerLocale("en");
  });

  test("exposes range picker", () => {
    render(<DmDatePicker.RangePicker defaultValue={["2026-01-01", "2026-01-02"]} />);

    expect(screen.getByDisplayValue("2026-01-01")).toBeTruthy();
    expect(screen.getByDisplayValue("2026-01-02")).toBeTruthy();
  });
});
