import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Select } from "./Select";
import type { SelectChangeValue, SelectOptionType } from "./Select.types";

describe("Select", () => {
  test("renders options, placeholder, size, status, loading, and disabled classes", () => {
    const { container } = render(
      <Select
        className="custom-select"
        disabled
        loading
        placeholder="Pick one"
        size="lg"
        status="error"
        options={[{ label: "Alpha", value: "alpha" }]}
      />,
    );

    const root = container.querySelector(".select-container") as HTMLElement;
    const trigger = container.querySelector(".select") as HTMLButtonElement;

    expect(root.className).toContain("custom-select");
    expect(root.className).toContain("select-loading");
    expect(trigger.className).toContain("select-lg");
    expect(trigger.className).toContain("select-error");
    expect(trigger.disabled).toBe(true);
    expect(screen.getByText("Pick one")).toBeTruthy();
  });

  test("supports uncontrolled selection and onChange payload", () => {
    let changedValue: SelectChangeValue;
    let changedLabel: React.ReactNode;

    render(
      <Select
        placeholder="Pick"
        options={[
          { label: "Alpha", value: "alpha" },
          { label: "Beta", value: "beta" },
        ]}
        onChange={(value, option) => {
          changedValue = value;
          changedLabel = (option as SelectOptionType | undefined)?.label;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Pick/ }));
    fireEvent.click(screen.getByRole("option", { name: "Beta" }));

    expect(changedValue).toBe("beta");
    expect(changedLabel).toBe("Beta");
    expect(screen.getByRole("button", { name: /Beta/ })).toBeTruthy();
  });

  test("supports allowClear for single values", () => {
    let changedValue: SelectChangeValue = "alpha";

    render(
      <Select
        allowClear
        defaultValue="alpha"
        options={[{ label: "Alpha", value: "alpha" }]}
        onChange={(value) => {
          changedValue = value;
        }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Clear selection"));

    expect(changedValue).toBeUndefined();
  });

  test("supports multiple mode toggling", () => {
    let changedValue: SelectChangeValue = [];

    render(
      <Select
        mode="multiple"
        options={[
          { label: "Alpha", value: "alpha" },
          { label: "Beta", value: "beta" },
        ]}
        onChange={(value) => {
          changedValue = value;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
    fireEvent.click(screen.getByRole("option", { name: "Beta" }));

    expect(changedValue).toEqual(["alpha", "beta"]);
    expect(screen.getAllByText("Alpha")[0].className).toContain("select-tag");
    expect(screen.getAllByText("Beta")[0].className).toContain("select-tag");
  });

  test("supports showSearch and filterOption", () => {
    render(
      <Select
        showSearch
        placeholder="Search"
        options={[
          { label: "Alpha", value: "alpha" },
          { label: "Beta", value: "beta" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Search/ }));
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "bet" },
    });

    expect(screen.queryByRole("option", { name: "Alpha" })).toBeNull();
    expect(screen.getByRole("option", { name: "Beta" })).toBeTruthy();
  });

  test("supports tags mode custom values", () => {
    let changedValue: SelectChangeValue = [];

    render(
      <Select
        mode="tags"
        placeholder="Tags"
        onChange={(value) => {
          changedValue = value;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Tags/ }));
    fireEvent.change(screen.getByPlaceholderText("Tags"), {
      target: { value: "custom" },
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Tags"), { key: "Enter" });

    expect(changedValue).toEqual(["custom"]);
    expect(screen.getByText("custom").className).toContain("select-tag");
  });

  test("supports Select.Option and Select.OptGroup children", () => {
    render(
      <Select placeholder="Grouped">
        <Select.OptGroup label="Group A">
          <Select.Option value="alpha">Alpha</Select.Option>
        </Select.OptGroup>
      </Select>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Grouped/ }));

    expect(screen.getByText("Group A")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Alpha" })).toBeTruthy();
  });
});
