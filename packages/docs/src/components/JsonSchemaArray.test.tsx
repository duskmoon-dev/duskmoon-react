import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { compileForm } from "../lib/json-schema-form";

describe("JSON Schema array item actions", () => {
  test("icon actions remove their primitive, object or nested item and reset restores defaults", () => {
    const initial = {
      tags: ["first", "second"],
      contacts: [{ name: "Ada" }, { name: "Grace" }],
      batches: [[1, 2], [3]],
    };
    const compiled = compileForm({
      type: "object",
      default: initial,
      properties: {
        tags: { type: "array", title: "Tags", items: { type: "string" } },
        contacts: {
          type: "array",
          title: "Contacts",
          items: {
            type: "object",
            properties: { name: { type: "string", title: "Name" } },
          },
        },
        batches: {
          type: "array",
          title: "Batches",
          items: {
            type: "array",
            title: "Scores",
            items: { type: "number", title: "Score" },
          },
        },
      },
    });
    let submitted: unknown;
    render(
      <JsonSchemaForm
        compiled={compiled}
        onSubmit={(value) => (submitted = value)}
      />,
    );
    const removeButtons = screen.getAllByRole("button", { name: /^Remove / });
    expect(removeButtons).toHaveLength(9);
    for (const button of removeButtons) {
      expect(button.textContent).toBe("");
      expect(button.getAttribute("type")).toBe("button");
      expect(button.classList.contains("btn-square")).toBe(true);
      expect(button.classList.contains("btn-ghost")).toBe(true);
      expect(button.classList.contains("btn-error")).toBe(true);
      expect(button.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
      expect(button.parentElement?.lastElementChild).toBe(button);
    }
    fireEvent.click(screen.getByRole("button", { name: "Remove Tags 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Contacts 1" }));
    fireEvent.click(
      within(screen.getAllByRole("group", { name: "Scores" })[0]).getByRole(
        "button",
        { name: "Remove Scores 1" },
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove Batches 2" }));
    expect(submitted).toBeUndefined();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toEqual({
      tags: ["second"],
      contacts: [{ name: "Grace" }],
      batches: [[2]],
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset form" }));
    expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(9);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toEqual(initial);
  });

  test("deleting retains array minimum validation and re-enables the maximum-limited add action", () => {
    const compiled = compileForm({
      type: "object",
      properties: {
        tags: {
          type: "array",
          title: "Tags",
          minItems: 1,
          maxItems: 1,
          default: ["first"],
          items: { type: "string", default: "replacement" },
        },
      },
    });
    let submitted: unknown;
    render(
      <JsonSchemaForm
        compiled={compiled}
        onSubmit={(value) => (submitted = value)}
      />,
    );
    const add = screen.getByRole("button", {
      name: "Add Tags",
    }) as HTMLButtonElement;
    expect(add.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Remove Tags 1" }));
    expect(add.disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toBeUndefined();
    expect(screen.getByRole("alert").textContent).toContain("fewer than 1");
    fireEvent.click(add);
    expect(add.disabled).toBe(true);
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submitted).toEqual({ tags: ["replacement"] });
  });
});
