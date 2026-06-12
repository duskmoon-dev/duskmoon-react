import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AutoComplete } from "./AutoComplete";
import type { AutoCompleteOptionType } from "./AutoComplete.types";

describe("AutoComplete", () => {
  test("renders combobox, placeholder, classes, and options", () => {
    const { container } = render(
      <AutoComplete
        className="custom-autocomplete"
        defaultOpen
        placeholder="Search"
        options={[{ value: "alpha", label: "Alpha" }]}
      />,
    );

    const root = container.querySelector(".autocomplete") as HTMLElement;
    const input = screen.getByRole("combobox") as HTMLInputElement;

    expect(root.className).toContain("custom-autocomplete");
    expect(input.placeholder).toBe("Search");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Alpha" })).toBeTruthy();
  });

  test("supports uncontrolled search and filtering", () => {
    let searched = "";
    let changed = "";

    render(
      <AutoComplete
        placeholder="Search"
        options={[
          { value: "alpha", label: "Alpha" },
          { value: "beta", label: "Beta" },
        ]}
        onChange={(value) => {
          changed = value;
        }}
        onSearch={(value) => {
          searched = value;
        }}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "bet" },
    });

    expect(changed).toBe("bet");
    expect(searched).toBe("bet");
    expect(screen.queryByRole("option", { name: "Alpha" })).toBeNull();
    expect(screen.getByRole("option", { name: "Beta" })).toBeTruthy();
  });

  test("supports selecting an option", () => {
    let selectedValue = "";
    let selectedOption: AutoCompleteOptionType | undefined;
    let changedValue = "";

    render(
      <AutoComplete
        defaultOpen
        options={[
          { value: "alpha", label: "Alpha" },
          { value: "beta", label: "Beta" },
        ]}
        onChange={(value) => {
          changedValue = value;
        }}
        onSelect={(value, option) => {
          selectedValue = value;
          selectedOption = option;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("option", { name: "Beta" }));

    expect(changedValue).toBe("beta");
    expect(selectedValue).toBe("beta");
    expect(selectedOption?.label).toBe("Beta");
    expect(screen.getByRole("combobox")).toHaveProperty("value", "beta");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  test("supports controlled value and open state", () => {
    render(
      <AutoComplete
        open
        value="alpha"
        options={[
          { value: "alpha", label: "Alpha" },
          { value: "beta", label: "Beta" },
        ]}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveProperty("value", "alpha");
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Alpha" }).className).toContain(
      "autocomplete-option-selected",
    );
  });

  test("supports allowClear", () => {
    let changedValue = "alpha";

    render(
      <AutoComplete
        allowClear
        defaultValue="alpha"
        options={[{ value: "alpha", label: "Alpha" }]}
        onChange={(value) => {
          changedValue = value;
        }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Clear selection"));

    expect(changedValue).toBe("");
    expect(screen.getByRole("combobox")).toHaveProperty("value", "");
  });

  test("supports AutoComplete.Option children and notFoundContent", () => {
    render(
      <AutoComplete defaultOpen defaultValue="zzz" notFoundContent="No match">
        <AutoComplete.Option value="alpha">Alpha</AutoComplete.Option>
      </AutoComplete>,
    );

    expect(screen.queryByRole("option", { name: "Alpha" })).toBeNull();
    expect(screen.getByText("No match")).toBeTruthy();
  });

  test("supports disabled state", () => {
    render(
      <AutoComplete
        disabled
        defaultOpen
        options={[{ value: "alpha", label: "Alpha" }]}
      />,
    );

    const input = screen.getByRole("combobox");
    expect(input).toHaveProperty("disabled", true);
    expect(input.getAttribute("aria-disabled")).toBe("true");
  });

  test("includes component stylesheet rules", () => {
    const styles = readFileSync(join(import.meta.dir, "../../styles.css"), {
      encoding: "utf8",
    });

    expect(styles).toContain(".autocomplete-input-wrapper");
    expect(styles).toContain(".autocomplete-toggle");
    expect(styles).toContain(".autocomplete-option-selected");
    expect(styles).toContain(".autocomplete-no-options");
  });
});
