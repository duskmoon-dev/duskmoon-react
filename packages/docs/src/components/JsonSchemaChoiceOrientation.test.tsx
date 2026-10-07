import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { compileForm } from "../lib/json-schema-form";
import { JsonSchemaForm } from "./JsonSchemaForm";

describe("JSON Form choice group orientation", () => {
  test.each(["horizontal", "vertical", undefined])(
    "orientation %j preserves typed selections, disabled options, and reset",
    (orientation) => {
      const config = orientation ? { "x-widget-options": { orientation } } : {};
      const compiled = compileForm({
        type: "object",
        properties: {
          priority: {
            type: "integer",
            title: "Priority",
            "x-widget": "radio-group",
            enum: [0, 1, 2],
            default: 0,
            ...config,
            "x-options": [
              { value: 0, label: "Normal" },
              { value: 1, label: "High" },
              { value: 2, label: "Unavailable", disabled: true },
            ],
          },
          flags: {
            type: "array",
            title: "Flags",
            "x-widget": "checkbox-group",
            uniqueItems: true,
            items: { type: "boolean", enum: [false, true] },
            default: [false],
            ...config,
          },
        },
      });
      let payload: unknown;
      render(
        <JsonSchemaForm
          compiled={compiled}
          onSubmit={(value) => {
            payload = value;
          }}
        />,
      );
      const radioGroup = screen.getByRole("radiogroup", { name: "Priority" });
      const checkboxGroup = screen.getByRole("group", { name: "Flags" });
      for (const group of [radioGroup, checkboxGroup])
        expect(
          group.classList.contains(
            `schema-choice-${orientation ?? "vertical"}`,
          ),
        ).toBe(true);
      expect(radioGroup.getAttribute("aria-orientation")).toBe(
        orientation ?? "vertical",
      );
      expect(checkboxGroup.hasAttribute("aria-orientation")).toBe(false);
      expect(
        (screen.getByRole("radio", { name: "Unavailable" }) as HTMLInputElement)
          .disabled,
      ).toBe(true);
      fireEvent.click(screen.getByRole("radio", { name: "High" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "true" }));
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(payload).toEqual({ priority: 1, flags: [false, true] });
      fireEvent.click(screen.getByRole("button", { name: "Reset form" }));
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(payload).toEqual({ priority: 0, flags: [false] });
    },
  );

  test("horizontal radio errors retain description, required status, and first-option focus", () => {
    const compiled = compileForm({
      type: "object",
      default: {},
      required: ["choice"],
      properties: {
        choice: {
          type: "integer",
          title: "Choice",
          description: "Choose an answer.",
          "x-widget": "radio-group",
          "x-widget-options": { orientation: "horizontal" },
          enum: [0, 1],
        },
      },
    });
    render(<JsonSchemaForm compiled={compiled} onSubmit={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    const group = screen.getByRole("radiogroup", { name: "Choice" });
    const first = screen.getByRole("radio", { name: "0" });
    expect(group.getAttribute("aria-required")).toBe("true");
    expect(document.activeElement).toBe(first);
    expect(first.getAttribute("aria-invalid")).toBe("true");
    const describedIds = first.getAttribute("aria-describedby")!;
    expect(group.getAttribute("aria-describedby")).toBe(describedIds);
    expect(
      describedIds
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent),
    ).toEqual(["Choose an answer.", "must have required property 'choice'"]);
  });

  test("horizontal checkbox groups keep invalid defaults removable and reset restores them", () => {
    const compiled = compileForm({
      type: "object",
      properties: {
        choices: {
          type: "array",
          title: "Choices",
          "x-widget": "checkbox-group",
          "x-widget-options": { orientation: "horizontal" },
          uniqueItems: true,
          items: { type: "integer", enum: [0, 1] },
          default: [9, 0],
        },
      },
    });
    let payload: unknown;
    render(
      <JsonSchemaForm
        compiled={compiled}
        onSubmit={(value) => {
          payload = value;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(payload).toBeUndefined();
    expect(screen.getByRole("alert").textContent).toContain("allowed values");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "9 (not an option)" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(payload).toEqual({ choices: [0, 1] });
    fireEvent.click(screen.getByRole("button", { name: "Reset form" }));
    expect(
      (
        screen.getByRole("checkbox", {
          name: "9 (not an option)",
        }) as HTMLInputElement
      ).checked,
    ).toBe(true);
  });
});
