import React from "react";
import { describe, expect, test } from "bun:test";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { compileForm } from "../lib/json-schema-form";

const metadataItems = {
  type: "object",
  additionalProperties: false,
  required: ["name", "size", "type", "lastModified"],
  properties: {
    name: { type: "string" },
    size: { type: "integer" },
    type: { type: "string" },
    lastModified: { type: "integer" },
  },
};
function show(field: object, defaults?: object) {
  let payload: unknown;
  let resets = 0;
  const { container } = render(
    <JsonSchemaForm
      compiled={compileForm({
        type: "object",
        ...(defaults ? { default: defaults } : {}),
        properties: { field: { title: "Field", ...field } },
      })}
      onSubmit={(value) => {
        payload = value;
      }}
      onReset={() => resets++}
    />,
  );
  return {
    container,
    submit: () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Submit",
        }),
      );
      return payload;
    },
    reset: () =>
      fireEvent.click(
        screen.getByRole("button", {
          name: "Reset form",
        }),
      ),
    resets: () => resets,
  };
}
const choices = [
  { value: 1, label: "Parent", children: [{ value: 2, label: "Leaf" }] },
];

describe("generated schema controls", () => {
  test("inline checkbox label preserves acceptance errors, focus, and reset", () => {
    const form = show({
      type: "boolean",
      "x-widget": "checkbox",
      enum: [true],
      default: false,
      description: "Accept to continue",
    });
    const checkbox = screen.getByRole("checkbox", {
      name: "Field",
      exact: true,
    }) as HTMLInputElement;
    const label = checkbox.closest("label")!;
    expect(label.querySelector(".checkbox-text")?.textContent).toBe("Field");
    expect(form.submit()).toBeUndefined();
    const alert = screen.getByRole("alert");
    expect(checkbox.getAttribute("aria-invalid")).toBe("true");
    expect(checkbox.getAttribute("aria-describedby")?.split(" ")).toEqual([
      screen.getByText("Accept to continue").id,
      alert.id,
    ]);
    expect(document.activeElement).toBe(checkbox);
    fireEvent.click(label.querySelector(".checkbox-text")!);
    expect(form.submit()).toEqual({ field: true });
    expect(checkbox.getAttribute("aria-invalid")).toBe("false");
    form.reset();
    expect(checkbox.checked).toBe(false);
  });

  test.each(["input", "mentions", "otp-input"])(
    "edits %s as a string, preserving leading zeros",
    (widget) => {
      const form = show({
        type: "string",
        "x-widget": widget,
        ...(widget === "mentions"
          ? { "x-options": [{ value: "team", label: "Team" }] }
          : {}),
      });
      fireEvent.change(
        screen.getByRole(widget === "mentions" ? "combobox" : "textbox", {
          name: "Field",
        }),
        {
          target: { value: "001234" },
        },
      );
      expect(form.submit()).toEqual({ field: "001234" });
      form.reset();
      expect(
        (
          screen.getByRole(widget === "mentions" ? "combobox" : "textbox", {
            name: "Field",
          }) as HTMLInputElement
        ).value,
      ).toBe("");
    },
  );

  test("InputNumber preserves invalid numeric edits for Ajv and clearing removes optional values", () => {
    const form = show({
      type: "integer",
      "x-widget": "input-number",
      minimum: 5,
      default: 8,
    });
    const input = screen.getByRole("textbox", { name: "Field" });
    fireEvent.change(input, { target: { value: "3" } });
    expect(form.submit()).toBeUndefined();
    expect(screen.getByRole("alert").textContent).toContain(">= 5");
    expect((input as HTMLInputElement).value).toBe("3");
    fireEvent.change(input, { target: { value: "9" } });
    expect(form.submit()).toEqual({ field: 9 });
    fireEvent.change(input, { target: { value: "" } });
    expect(form.submit()).toEqual({});
    form.reset();
    expect(
      (screen.getByRole("textbox", { name: "Field" }) as HTMLInputElement)
        .value,
    ).toBe("8");
  });

  test.each(["checkbox", "switch"])(
    "%s honors boolean enum constraints",
    (widget) => {
      const form = show({ type: "boolean", "x-widget": widget, enum: [true] });
      form.submit();
      expect(screen.getByRole("alert")).toBeTruthy();
      fireEvent.click(screen.getByRole(widget, { name: "Field" }));
      expect(form.submit()).toEqual({ field: true });
    },
  );

  test("radio alias uses canonical option labels and preserves numeric enum values", () => {
    const form = show({
      type: "number",
      "x-widget": "radio",
      enum: [0, 1.5],
      "x-options": [
        { value: 0, label: "None" },
        { value: 1.5, label: "High" },
      ],
    });
    fireEvent.click(screen.getByRole("radio", { name: "High" }));
    expect(form.submit()).toEqual({ field: 1.5 });
  });

  test.each(["date-picker", "dm-date-picker"])(
    "%s returns ISO calendar strings and clears",
    (widget) => {
      const form = show({ type: "string", "x-widget": widget });
      const input = screen.getByLabelText("Field");
      fireEvent.change(input, { target: { value: "2026-10-06" } });
      expect(form.submit()).toEqual({ field: "2026-10-06" });
      fireEvent.click(screen.getByRole("button", { name: "Clear date" }));
      expect(form.submit()).toEqual({});
    },
  );

  test("time picker normalizes valid local clocks and retains partial edits for validation", () => {
    const form = show({ type: "string", "x-widget": "time-picker" });
    const input = screen.getByLabelText("Field");
    fireEvent.change(input, { target: { value: "09:30" } });
    expect(form.submit()).toEqual({ field: "09:30:00" });
    fireEvent.change(input, { target: { value: "09:" } });
    form.submit();
    expect(screen.getByRole("alert").textContent).toContain("HH:mm:ss");
    expect((input as HTMLInputElement).value).toBe("09:");
  });

  test("color picker submits hex values and resets its natural default", () => {
    const form = show({ type: "string", "x-widget": "color-picker" });
    expect(form.submit()).toEqual({ field: "#000000" });
    fireEvent.click(screen.getByRole("button", { name: "Field" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Color value" }), {
      target: { value: "#ff0000" },
    });
    expect(form.submit()).toEqual({ field: "#ff0000" });
    form.reset();
    expect(form.submit()).toEqual({ field: "#000000" });
  });

  test.each(["select", "segmented"])(
    "%s maps boolean choices through reversible keys",
    (widget) => {
      const form = show({
        type: "boolean",
        "x-widget": widget,
        enum: [false, true],
        "x-options": [
          { value: false, label: "Off" },
          { value: true, label: "On" },
        ],
      });
      if (widget === "select")
        fireEvent.click(screen.getByRole("button", { name: "Off" }));
      fireEvent.click(
        screen.getByRole(widget === "select" ? "option" : "radio", {
          name: "On",
        }),
      );
      expect(form.submit()).toEqual({ field: true });
      form.reset();
      expect(form.submit()).toEqual({ field: false });
    },
  );

  test("empty scalar Select remounts on reset without reserving an enum value", () => {
    const form = show({
      type: "string",
      "x-widget": "select",
      enum: ["", "a"],
    });
    fireEvent.click(screen.getByRole("button", { name: "Choose Field" }));
    fireEvent.click(screen.getByRole("option", { name: "a" }));
    expect(form.submit()).toEqual({ field: "a" });
    form.reset();
    expect(screen.getByRole("button", { name: "Choose Field" })).toBeTruthy();
    expect(form.submit()).toEqual({});
  });

  test("multiple Select preserves and permits removing invalid defaults during unrelated edits", () => {
    const form = show({
      type: "array",
      "x-widget": "select",
      uniqueItems: true,
      items: { type: "integer", enum: [0, 1] },
      default: [9],
    });
    fireEvent.click(
      screen.getByRole("button", { name: /9 \(not an option\)/ }),
    );
    fireEvent.click(screen.getByRole("option", { name: "0" }));
    expect(screen.getByText("[9,0]")).toBeTruthy();
    form.submit();
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("option", { name: "9 (not an option)" }));
    expect(form.submit()).toEqual({ field: [0] });
  });

  test("Rate and Slider retain constraint-invalid defaults and make edits numeric", () => {
    let payload: unknown;
    render(
      <JsonSchemaForm
        compiled={compileForm({
          type: "object",
          properties: {
            rate: {
              type: "number",
              title: "Score",
              "x-widget": "rate",
              default: 99,
              maximum: 5,
            },
            slider: {
              type: "number",
              title: "Volume",
              "x-widget": "slider",
              minimum: 0,
              maximum: 10,
              default: 99,
              "x-widget-options": { step: 0.5 },
            },
          },
        })}
        onSubmit={(value) => {
          payload = value;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(screen.getAllByText("99")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: "3 of 5" }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "4.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(payload).toEqual({ rate: 3, slider: 4.5 });
  });

  test("ancestor partial defaults show explicit Set actions instead of silent values", () => {
    const form = show({ type: "string", "x-widget": "color-picker" }, {});
    expect(screen.getByRole("button", { name: "Field" }).textContent).toBe(
      "Set Field",
    );
    expect(form.submit()).toEqual({});
    fireEvent.click(screen.getByRole("button", { name: "Field" }));
    expect(form.submit()).toEqual({ field: "#000000" });
    form.reset();
    expect(form.submit()).toEqual({});
  });

  test("Cascader selects complete numeric paths and resets to []", () => {
    const form = show({
      type: "array",
      "x-widget": "cascader",
      items: { type: "integer", enum: [1, 2] },
      "x-options": choices,
    });
    fireEvent.click(screen.getByRole("button", { name: /Choose Field/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Parent/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Leaf" }));
    expect(form.submit()).toEqual({ field: [1, 2] });
    form.reset();
    expect(form.submit()).toEqual({ field: [] });
  });

  test.each([false, true])(
    "TreeSelect numeric scalar/array (array=%j) selection resets",
    (multiple) => {
      const form = show({
        type: multiple ? "array" : "integer",
        "x-widget": "tree-select",
        ...(multiple
          ? { uniqueItems: true, items: { type: "integer", enum: [1, 2] } }
          : { enum: [1, 2] }),
        "x-options": choices,
      });
      fireEvent.click(screen.getByRole("button", { name: /Choose Field/ }));
      fireEvent.click(screen.getByRole("button", { name: "Expand Parent" }));
      fireEvent.click(screen.getByRole("treeitem", { name: "Leaf" }));
      expect(form.submit()).toEqual({ field: multiple ? [2] : 2 });
      form.reset();
      expect(form.submit()).toEqual(multiple ? { field: [] } : {});
      expect(screen.getByRole("button", { name: /Choose Field/ })).toBeTruthy();
    },
  );

  test("Transfer preserves invalid selections and allows removing them", () => {
    const form = show({
      type: "array",
      "x-widget": "transfer",
      uniqueItems: true,
      items: { type: "string", enum: ["a", "b"] },
      default: ["missing", "missing"],
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "a" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Move selected items to target" }),
    );
    expect(screen.getByText('["missing","missing","a"]')).toBeTruthy();
    form.submit();
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "missing (not an option)" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Move selected items to source" }),
    );
    expect(form.submit()).toEqual({ field: ["a"] });
  });

  test("Upload creates only serializable local metadata, preserves duplicates, removes files and resets", async () => {
    const old = {
      name: "old.txt",
      size: 3,
      type: "text/plain",
      lastModified: 1,
    };
    const form = show({
      type: "array",
      "x-widget": "upload",
      uniqueItems: true,
      items: metadataItems,
      default: [old, old],
    });
    const file = new File(["hello"], "new.txt", {
      type: "text/plain",
      lastModified: 123,
    });
    fireEvent.change(screen.getByLabelText("Field files"), {
      target: { files: [file] },
    });
    await waitFor(() => expect(screen.getByText("new.txt")).toBeTruthy());
    form.submit();
    expect(screen.getByRole("alert").textContent).toContain("duplicate");
    const removes = screen.getAllByRole("button", { name: "Remove old.txt" });
    fireEvent.click(removes[0]);
    expect(form.submit()).toEqual({
      field: [
        old,
        { name: "new.txt", size: 5, type: "text/plain", lastModified: 123 },
      ],
    });
    fireEvent.click(screen.getByRole("button", { name: "Remove old.txt" }));
    expect(form.submit()).toEqual({
      field: [
        { name: "new.txt", size: 5, type: "text/plain", lastModified: 123 },
      ],
    });
    form.reset();
    expect(screen.queryByText("new.txt")).toBeNull();
    expect(screen.getAllByText("old.txt")).toHaveLength(2);
  });

  test("uses one native form/store and restores typed nested values", () => {
    const form = show({
      type: "object",
      title: "Contact",
      properties: {
        score: {
          type: "integer",
          title: "Score",
          "x-widget": "input-number",
          default: 0,
        },
        enabled: {
          type: "boolean",
          title: "Enabled",
          "x-widget": "switch",
          default: false,
        },
      },
    });
    expect(form.container.querySelectorAll("form")).toHaveLength(1);
    expect(form.container.querySelector("label label")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Score" }), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("switch", { name: "Enabled" }));
    expect(form.submit()).toEqual({ field: { score: 7, enabled: true } });
    form.reset();
    expect(form.resets()).toBe(1);
    expect(form.submit()).toEqual({ field: { score: 0, enabled: false } });
  });

  test("nested array widgets edit correct row and focus the actual invalid composite control", () => {
    const form = show({
      type: "array",
      default: [{ value: [] }],
      items: {
        type: "object",
        properties: {
          value: {
            type: "array",
            title: "Choices",
            "x-widget": "select",
            uniqueItems: true,
            minItems: 1,
            description: "Pick a flag",
            items: { type: "boolean", enum: [false, true] },
          },
        },
      },
    });
    form.submit();
    const button = screen.getByRole("button", { name: "Choose Choices" });
    expect(document.activeElement).toBe(button);
    const group = within(screen.getByRole("group", { name: "Choices" }));
    fireEvent.click(button);
    fireEvent.click(group.getByRole("option", { name: "false" }));
    expect(form.submit()).toEqual({ field: [{ value: [false] }] });
  });
});

describe("widget reset and nested defaults", () => {
  test("reset clears Transfer temporary checks and closes choice popups", () => {
    const form = show({
      type: "array",
      "x-widget": "transfer",
      uniqueItems: true,
      items: { type: "string", enum: ["a", "b"] },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "a" }));
    expect(
      (screen.getByRole("checkbox", { name: "a" }) as HTMLInputElement).checked,
    ).toBe(true);
    form.reset();
    expect(
      (screen.getByRole("checkbox", { name: "a" }) as HTMLInputElement).checked,
    ).toBe(false);
    expect(
      (
        screen.getByRole("button", {
          name: "Move selected items to target",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(form.submit()).toEqual({ field: [] });
  });

  test("new object array rows materialize natural widget values while reset removes the row", () => {
    const form = show({
      type: "array",
      items: {
        type: "object",
        properties: {
          volume: {
            type: "integer",
            "x-widget": "slider",
            minimum: 10,
            maximum: 20,
          },
          color: { type: "string", "x-widget": "color-picker" },
          mode: { type: "integer", "x-widget": "segmented", enum: [1, 2] },
          score: { type: "integer", "x-widget": "rate" },
        },
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Field" }));
    expect(form.submit()).toEqual({
      field: [{ volume: 10, color: "#000000", mode: 1, score: 0 }],
    });
    form.reset();
    expect(form.submit()).toEqual({ field: [] });
  });

  test("composite validation focuses a visible Upload trigger and announces its metadata error", () => {
    const form = show({
      type: "array",
      "x-widget": "upload",
      uniqueItems: true,
      minItems: 1,
      items: metadataItems,
    });
    form.submit();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Field" }),
    );
    const group = screen.getByRole("group", { name: "Field" });
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-describedby")).toContain(
      screen.getByRole("alert").id,
    );
    form.reset();
    expect(group.getAttribute("aria-invalid")).toBe("false");
    expect(group.getAttribute("aria-describedby")).toBeNull();
  });
});
