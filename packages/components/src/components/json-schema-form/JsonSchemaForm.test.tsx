import React, { useState } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  JsonSchemaForm,
  compileForm,
  widgetNames,
  type FormErrors,
  type FormValue,
  type RenderableSchema,
} from "./index";

const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["name"],
  properties: {
    name: { type: "string", title: "Name", minLength: 1 },
    age: { type: "integer", title: "Age", minimum: 0 },
    active: { type: "boolean", title: "Active" },
  },
} satisfies RenderableSchema;

describe("published JSON Schema form contract", () => {
  test("accepts a schema and submits typed JSON without mutating defaults", () => {
    const defaultValue: FormValue = { name: "Ada", active: true };
    let submitted: FormValue | undefined;
    render(
      <JsonSchemaForm
        schema={schema}
        defaultValue={defaultValue}
        onSubmit={(next) => {
          submitted = next;
        }}
      />,
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: "Age" }), {
      target: { value: "37" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toEqual({ name: "Ada", age: 37, active: true });
    expect(defaultValue).toEqual({ name: "Ada", active: true });
  });

  test("controlled edits notify the owner and render only the supplied value", () => {
    const value: FormValue = { name: "Ada" };
    let changed: FormValue | undefined;
    const props = {
      schema,
      value,
      onChange: (next: FormValue) => {
        changed = next;
      },
      onSubmit: () => {},
    };
    const { rerender } = render(<JsonSchemaForm {...props} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Grace" },
    });
    expect(changed).toEqual({ name: "Grace" });
    expect(value).toEqual({ name: "Ada" });
    expect(
      (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value,
    ).toBe("Ada");
    rerender(<JsonSchemaForm {...props} value={changed} />);
    expect(
      (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value,
    ).toBe("Grace");
  });

  test("validates before submit and reports JSON Pointer errors for the backend", () => {
    let submitted = false;
    let errors: FormErrors = {};
    render(
      <JsonSchemaForm
        compiled={compileForm(schema)}
        onErrorsChange={(next) => {
          errors = next;
        }}
        onSubmit={() => {
          submitted = true;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toBe(false);
    expect(errors["/name"]).toContain("required");
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Name" }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Ada" },
    });
    expect(errors).toEqual({});
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toBe(true);
  });

  test("backend errors can be cleared on edit and controlled reset restores defaults", () => {
    let resets = 0;
    function Island() {
      const [value, setValue] = useState<FormValue>({ name: "Grace" });
      const [errors, setErrors] = useState<FormErrors>({
        "/name": "Already taken",
      });
      return (
        <JsonSchemaForm
          schema={schema}
          value={value}
          defaultValue={{ name: "Ada" }}
          onChange={setValue}
          errors={errors}
          onErrorsChange={setErrors}
          onSubmit={() => {}}
          onReset={() => {
            resets += 1;
          }}
        />
      );
    }
    render(<Island />);
    expect(screen.getByRole("alert").textContent).toBe("Already taken");
    expect(
      screen
        .getByRole("textbox", { name: "Name" })
        .getAttribute("aria-invalid"),
    ).toBe("true");
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Lin" },
    });
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reset form" }));
    expect(
      (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value,
    ).toBe("Ada");
    expect(resets).toBe(1);
  });

  test("publishes widget names and rejects unsupported schema features", () => {
    expect(widgetNames).toContain("select");
    expect(() => compileForm({ ...schema, oneOf: [] })).toThrow(
      'unsupported keyword "oneOf"',
    );
  });
});
