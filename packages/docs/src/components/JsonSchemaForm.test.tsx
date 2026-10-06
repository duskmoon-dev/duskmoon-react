import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { JsonSchemaFormDemo } from "./JsonSchemaFormDemo";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { compileForm } from "../lib/json-schema-form";

describe("JSON Schema demo", () => {
  test.each([
    [{ contact: 7 }, "schema/default/contact"],
    [{ contacts: [7] }, "schema/default/contacts/0"],
  ])(
    "rejects incompatible defaults on Generate and allows recovery: %j",
    (defaults, path) => {
      render(<JsonSchemaFormDemo />);
      const contact = {
        type: "object",
        properties: { email: { type: "string", title: "Email" } },
      };
      const schema = {
        type: "object",
        default: defaults,
        properties: {
          contact,
          contacts: { type: "array", items: contact },
        },
      };
      fireEvent.change(screen.getByRole("textbox", { name: "JSON Schema" }), {
        target: { value: JSON.stringify(schema) },
      });
      fireEvent.click(screen.getByRole("button", { name: "Generate form" }));
      expect(screen.getByRole("alert").textContent).toContain(
        `${path}: default must match type: object`,
      );
      expect(screen.queryByRole("textbox", { name: "Email" })).toBeNull();
      fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
        target: { value: "Ada" },
      });
      expect(
        (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement)
          .value,
      ).toBe("Ada");

      fireEvent.change(screen.getByRole("textbox", { name: "JSON Schema" }), {
        target: {
          value: JSON.stringify({ ...schema, default: { contacts: [{}] } }),
        },
      });
      fireEvent.click(screen.getByRole("button", { name: "Generate form" }));
      expect(screen.queryByRole("alert")).toBeNull();
      const emails = screen.getAllByRole("textbox", { name: "Email" });
      fireEvent.change(emails[0], { target: { value: "a@example.com" } });
      fireEvent.change(emails[1], { target: { value: "b@example.com" } });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(
        JSON.parse(screen.getByLabelText("Submitted JSON").textContent ?? ""),
      ).toEqual({
        contact: { email: "a@example.com" },
        contacts: [{ email: "b@example.com" }],
      });
    },
  );

  test("generates Profile on load, validates and submits typed JSON, then resets", () => {
    render(<JsonSchemaFormDemo />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeTruthy();
    expect(
      (screen.getByRole("checkbox", { name: "Active" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Age" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(
      JSON.parse(screen.getByLabelText("Submitted JSON").textContent ?? ""),
    ).toEqual({ name: "Ada", age: 0, role: "viewer", active: false });
    fireEvent.click(screen.getByRole("button", { name: "Reset form" }));
    expect(screen.getByLabelText("Submitted JSON").textContent).toContain(
      "Submit the form",
    );
    expect(
      (screen.getByRole("spinbutton", { name: "Age" }) as HTMLInputElement)
        .value,
    ).toBe("");
  });

  test("handles nested objects and array editing without stale row errors", () => {
    render(<JsonSchemaFormDemo />);
    fireEvent.change(screen.getByRole("combobox", { name: "Example schema" }), {
      target: { value: "Nested object" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "a@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(
      JSON.parse(screen.getByLabelText("Submitted JSON").textContent ?? ""),
    ).toEqual({ contact: { email: "a@example.com" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Example schema" }), {
      target: { value: "Array" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("alert").textContent).toContain("items");
    fireEvent.click(screen.getByRole("button", { name: "Add Tags" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Tag" }), {
      target: { value: "first" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Tags" }));
    fireEvent.change(screen.getAllByRole("textbox", { name: "Tag" })[1], {
      target: { value: "second" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Remove Tags 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(
      JSON.parse(screen.getByLabelText("Submitted JSON").textContent ?? ""),
    ).toEqual({ tags: ["second"], contacts: [] });
  });

  test("rejects malformed and unsupported schema input", () => {
    render(<JsonSchemaFormDemo />);
    fireEvent.change(screen.getByRole("textbox", { name: "JSON Schema" }), {
      target: { value: "{" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate form" }));
    expect(screen.getByRole("alert").textContent).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "JSON Schema" }), {
      target: { value: '{"type":"object","oneOf":[]}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate form" }));
    expect(screen.getByRole("alert").textContent).toContain(
      "unsupported keyword",
    );
  });

  test("clearing array controls preserves rows and unique field IDs", () => {
    const compiled = compileForm({
      type: "object",
      properties: {
        "a/b": { type: "string", title: "Slash" },
        a_b: { type: "string", title: "Underscore" },
        scores: {
          type: "array",
          title: "Scores",
          items: { type: "number", title: "Score" },
        },
        choices: {
          type: "array",
          title: "Choices",
          items: { type: "string", title: "Choice", enum: ["one", "two"] },
        },
      },
    });
    render(<JsonSchemaForm compiled={compiled} onSubmit={() => {}} />);
    expect(
      (screen.getByRole("textbox", { name: "Slash" }) as HTMLInputElement).id,
    ).not.toBe(
      (screen.getByRole("textbox", { name: "Underscore" }) as HTMLInputElement)
        .id,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Scores" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Score" }), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Score" }), {
      target: { value: "" },
    });
    expect(screen.getByRole("spinbutton", { name: "Score" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add Choices" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Choice" }), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Choice" }), {
      target: { value: "" },
    });
    expect(screen.getByRole("combobox", { name: "Choice" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getAllByRole("alert").length).toBe(2);
  });

  test("edits a nested field when an object default omits its container", () => {
    const compiled = compileForm({
      type: "object",
      default: {},
      properties: {
        contact: {
          type: "object",
          properties: { email: { type: "string", title: "Email" } },
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
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "a@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(payload).toEqual({ contact: { email: "a@example.com" } });
  });
});

describe("JSON Schema widgets", () => {
  test("submits typed switch, numeric radios, and boolean checkbox choices and resets", () => {
    let payload: unknown;
    const compiled = compileForm({
      type: "object",
      properties: {
        enabled: {
          type: "boolean",
          title: "Enabled",
          "x-widget": "switch",
          default: true,
        },
        priority: {
          type: "number",
          title: "Priority",
          "x-widget": "radio-group",
          enum: [0, 1.5],
          default: 0,
        },
        flags: {
          type: "array",
          title: "Flags",
          "x-widget": "checkbox-group",
          uniqueItems: true,
          items: { type: "boolean", enum: [false, true] },
          default: [false],
        },
      },
    });
    render(
      <JsonSchemaForm
        compiled={compiled}
        onSubmit={(value) => {
          payload = value;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("switch", { name: "Enabled" }));
    fireEvent.click(screen.getByRole("radio", { name: "1.5" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "true" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(payload).toEqual({
      enabled: false,
      priority: 1.5,
      flags: [false, true],
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset form" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(payload).toEqual({ enabled: true, priority: 0, flags: [false] });
  });

  test("associates required radio group errors and description with its controls and focuses first option", () => {
    const compiled = compileForm({
      type: "object",
      required: ["choice"],
      properties: {
        choice: {
          type: "boolean",
          title: "Choice",
          description: "Choose one answer.",
          "x-widget": "radio-group",
          enum: [false, true],
          default: false,
        },
      },
      default: {},
    });
    render(<JsonSchemaForm compiled={compiled} onSubmit={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    const group = screen.getByRole("radiogroup", { name: "Choice" });
    expect(group.getAttribute("aria-required")).toBe("true");
    const option = screen.getByRole("radio", { name: "false" });
    expect(document.activeElement).toBe(option);
    expect(option.getAttribute("aria-invalid")).toBe("true");
    expect(
      option
        .getAttribute("aria-describedby")
        ?.split(" ")
        .map((id) => document.getElementById(id)?.textContent),
    ).toEqual(["Choose one answer.", "must have required property 'choice'"]);
    fireEvent.click(option);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("preserves and allows removing invalid checkbox defaults while editing other selections", () => {
    let payload: unknown;
    const compiled = compileForm({
      type: "object",
      properties: {
        choices: {
          type: "array",
          title: "Choices",
          description: "Pick numbers.",
          "x-widget": "checkbox-group",
          uniqueItems: true,
          items: { type: "integer", enum: [0, 1, 2] },
          default: [9, 0],
        },
      },
    });
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
    const first = screen.getByRole("checkbox", { name: "0" });
    expect(document.activeElement).toBe(first);
    expect(first.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("allowed values");
    expect(
      (
        screen.getByRole("checkbox", {
          name: "9 (not an option)",
        }) as HTMLInputElement
      ).checked,
    ).toBe(true);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "9 (not an option)" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(payload).toEqual({ choices: [0, 1] });
  });

  test("enforces switch enum and checkbox item and array constraints", () => {
    const compiled = compileForm({
      type: "object",
      properties: {
        enabled: {
          type: "boolean",
          title: "Enabled",
          "x-widget": "switch",
          enum: [true],
          default: false,
        },
        choices: {
          type: "array",
          title: "Choices",
          "x-widget": "checkbox-group",
          uniqueItems: true,
          minItems: 1,
          maxItems: 1,
          items: { type: "integer", enum: [0, 1], minimum: 1 },
          default: [],
        },
      },
    });
    render(<JsonSchemaForm compiled={compiled} onSubmit={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(document.activeElement).toBe(
      screen.getByRole("switch", { name: "Enabled" }),
    );
    expect(screen.getAllByRole("alert").length).toBe(2);
    fireEvent.click(screen.getByRole("switch", { name: "Enabled" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("alert").textContent).toContain(">= 1");
    expect(document.activeElement).toBe(
      screen.getByRole("checkbox", { name: "0" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("alert").textContent).toContain("more than 1");
  });

  test("materializes missing nested group containers and keeps radio names independent", () => {
    let payload: unknown;
    const choice = {
      type: "boolean",
      title: "Choice",
      "x-widget": "radio-group",
      enum: [false, true],
    };
    const compiled = compileForm({
      type: "object",
      default: {},
      properties: {
        contact: {
          type: "object",
          properties: {
            choice,
            flags: {
              type: "array",
              title: "Flags",
              "x-widget": "checkbox-group",
              uniqueItems: true,
              items: { type: "integer", enum: [0, 1] },
            },
          },
        },
        other: { ...choice, title: "Other" },
      },
    });
    render(
      <JsonSchemaForm
        compiled={compiled}
        onSubmit={(value) => {
          payload = value;
        }}
      />,
    );
    const radios = screen.getAllByRole("radio", { name: "false" });
    expect(radios[0].getAttribute("name")).not.toBe(
      radios[1].getAttribute("name"),
    );
    fireEvent.click(radios[0]);
    fireEvent.click(radios[1]);
    fireEvent.click(screen.getByRole("checkbox", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(payload).toEqual({
      contact: { choice: false, flags: [0] },
      other: false,
    });
  });
});
