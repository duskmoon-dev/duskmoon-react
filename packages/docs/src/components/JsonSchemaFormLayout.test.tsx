import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { compileForm } from "../lib/json-schema-form";

describe("JSON Schema form presentation", () => {
  test.each([undefined, "checkbox"])(
    "standalone %s checkbox has one clickable inline label with required help",
    (widget) => {
      let submitted: unknown;
      const compiled = compileForm({
        type: "object",
        properties: {
          updates: {
            type: "boolean",
            title: "Receive updates",
            description: "Account announcements",
            default: false,
            ...(widget ? { "x-widget": widget } : {}),
          },
        },
        required: ["updates"],
      });
      const { container } = render(
        <JsonSchemaForm
          compiled={compiled}
          onSubmit={(value) => {
            submitted = value;
          }}
        />,
      );
      const checkbox = screen.getByRole("checkbox", {
        name: "Receive updates",
        exact: true,
      }) as HTMLInputElement;
      const item = checkbox.closest(".form-item")!;
      const label = checkbox.closest("label")!;
      expect(label.querySelector(".checkbox-text")?.textContent).toBe(
        "Receive updates",
      );
      expect(label.querySelector(".schema-required")).toBeTruthy();
      expect(
        label.querySelector(".schema-required")?.getAttribute("aria-hidden"),
      ).toBe("true");
      expect(item.classList.contains("form-item-required")).toBe(true);
      expect(item.querySelector(".form-item-label")).toBeNull();
      expect(screen.getAllByText("Receive updates")).toHaveLength(1);
      expect(container.querySelector("label label")).toBeNull();
      expect(checkbox.getAttribute("aria-describedby")).toBe(
        screen.getByText("Account announcements").id,
      );
      fireEvent.click(label.querySelector(".checkbox-text")!);
      expect(checkbox.checked).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(submitted).toEqual({ updates: true });
      fireEvent.click(screen.getByRole("button", { name: "Reset form" }));
      expect(checkbox.checked).toBe(false);
    },
  );

  test("nested object and array checkboxes keep their inline labels", () => {
    let submitted: unknown;
    const compiled = compileForm({
      type: "object",
      properties: {
        contact: {
          type: "object",
          properties: { active: { type: "boolean", title: "Active contact" } },
        },
        rows: {
          type: "array",
          title: "Rows",
          default: [false],
          items: { type: "boolean", "x-widget": "checkbox" },
        },
      },
    });
    render(
      <JsonSchemaForm
        compiled={compiled}
        onSubmit={(value) => {
          submitted = value;
        }}
      />,
    );
    for (const name of ["Active contact", "Rows 1"]) {
      const checkbox = screen.getByRole("checkbox", { name, exact: true });
      const label = checkbox.closest("label")!;
      expect(label.querySelector(".checkbox-text")?.textContent).toBe(name);
      fireEvent.click(label.querySelector(".checkbox-text")!);
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toEqual({ contact: { active: true }, rows: [true] });
  });

  test("keeps required fields labeled and links external descriptions and validation errors", () => {
    const compiled = compileForm({
      type: "object",
      properties: {
        email: {
          type: "string",
          title: "Email",
          description: "Use your work address",
          format: "email",
        },
      },
      required: ["email"],
    });
    const { container } = render(
      <JsonSchemaForm compiled={compiled} onSubmit={() => {}} />,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    const item = input.closest(".form-item");

    expect(container.querySelector("form")?.className).toContain(
      "form-vertical",
    );
    expect(item?.classList.contains("form-item-required")).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBe(
      screen.getByText("Use your work address").id,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    const alert = screen.getByRole("alert");
    expect(item?.classList.contains("form-item-error")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(
      alert.id,
    );
    expect(document.activeElement).toBe(input);
  });

  test("preserves checkbox and nested field labels with a native submit", () => {
    const compiled = compileForm({
      type: "object",
      properties: {
        contact: {
          type: "object",
          title: "Contact",
          properties: {
            active: { type: "boolean", title: "Active", default: true },
          },
        },
      },
      required: ["contact"],
    });
    let submitted: unknown;
    const { container } = render(
      <JsonSchemaForm
        compiled={compiled}
        onSubmit={(value) => {
          submitted = value;
        }}
      />,
    );

    expect(container.querySelector("legend.schema-required")?.textContent).toBe(
      "Contact",
    );
    const checkbox = screen.getByRole("checkbox", { name: "Active" });
    expect((checkbox as HTMLInputElement).checked).toBe(true);
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toEqual({ contact: { active: false } });
  });
});
