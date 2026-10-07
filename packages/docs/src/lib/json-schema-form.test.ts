import { describe, expect, test } from "bun:test";
import { compileForm } from "./json-schema-form";

describe("JSON Schema form compiler", () => {
  test.each([
    [7, "schema/default/contact"],
    [null, "schema/default/contact"],
    [[], "schema/default/contact"],
    [{ email: 7 }, "schema/default/contact/email"],
  ])(
    "rejects incompatible object descendants in defaults: %j",
    (contact, path) => {
      expect(() =>
        compileForm({
          type: "object",
          default: { contact },
          properties: {
            contact: {
              type: "object",
              properties: { email: { type: "string" } },
            },
          },
        }),
      ).toThrow(`${path}: default must match type:`);
    },
  );

  test.each([
    [7, "schema/properties/contacts/default/0"],
    [{ emails: {} }, "schema/properties/contacts/default/0/emails"],
    [{ emails: [7] }, "schema/properties/contacts/default/0/emails/0"],
  ])(
    "rejects incompatible array descendants in defaults: %j",
    (contact, path) => {
      expect(() =>
        compileForm({
          type: "object",
          properties: {
            contacts: {
              type: "array",
              default: [contact],
              items: {
                type: "object",
                properties: {
                  emails: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        }),
      ).toThrow(`${path}: default must match type:`);
    },
  );

  test("reports escaped property paths through nested arrays", () => {
    expect(() =>
      compileForm({
        type: "object",
        default: { "a/b~c": [[false]] },
        properties: {
          "a/b~c": {
            type: "array",
            items: { type: "array", items: { type: "integer" } },
          },
        },
      }),
    ).toThrow("schema/default/a~1b~0c/0/0: default must match type: integer");
  });

  test("preserves partial defaults without enforcing form constraints", () => {
    const defaults = { contacts: [{}, { email: "" }], tags: [], count: 0 };
    const form = compileForm({
      type: "object",
      default: defaults,
      properties: {
        name: { type: "string" },
        count: { type: "integer", minimum: 1 },
        contacts: {
          type: "array",
          items: {
            type: "object",
            properties: { email: { type: "string", minLength: 1 } },
            required: ["email"],
          },
        },
        tags: { type: "array", items: { type: "string" }, minItems: 1 },
      },
      required: ["name"],
    });
    expect(form.initialValue()).toEqual(defaults);
    expect(form.validate(form.initialValue()).valid).toBe(false);
  });

  test("initializes nested defaults without converting false or zero", () => {
    const form = compileForm({
      type: "object",
      properties: {
        name: { type: "string" },
        count: { type: "integer", default: 0 },
        active: { type: "boolean", default: false },
        contact: {
          type: "object",
          properties: { city: { type: "string", default: "Paris" } },
        },
        tags: { type: "array", items: { type: "string" } },
      },
    });
    expect(form.initialValue()).toEqual({
      count: 0,
      active: false,
      contact: { city: "Paris" },
      tags: [],
    });
    expect(form.validate(form.initialValue()).valid).toBe(true);
  });

  test("maps required, nested, and array validation errors to field paths", () => {
    const form = compileForm({
      type: "object",
      properties: {
        name: { type: "string", minLength: 2 },
        contact: {
          type: "object",
          properties: { email: { type: "string", format: "email" } },
          required: ["email"],
        },
        tags: {
          type: "array",
          minItems: 1,
          items: { type: "string", minLength: 1 },
        },
      },
      required: ["name"],
    });
    const result = form.validate({ contact: {}, tags: [] });
    expect(result.valid).toBe(false);
    expect(result.errors["/name"]).toContain("required");
    expect(result.errors["/contact/email"]).toContain("required");
    expect(result.errors["/tags"]).toContain("items");
    expect(
      form.validate({
        name: "Jo",
        contact: { email: "x@y.com" },
        tags: ["one"],
      }).valid,
    ).toBe(true);
  });

  test("rejects unsupported and unsafe schemas clearly", () => {
    expect(() => compileForm({ type: "object", oneOf: [] })).toThrow(
      "unsupported keyword",
    );
    expect(() =>
      compileForm({
        type: "object",
        properties: { x: { type: ["string", "null"] } },
      }),
    ).toThrow("supported type");
    expect(() =>
      compileForm(
        JSON.parse(
          '{"type":"object","properties":{"__proto__":{"type":"string"}}}',
        ),
      ),
    ).toThrow("unsafe property");
    expect(() =>
      compileForm({
        type: "object",
        properties: { x: { type: "array", items: [{ type: "string" }] } },
      }),
    ).toThrow("homogeneous");
    expect(() =>
      compileForm({
        type: "object",
        properties: { x: { type: "object", enum: [1] } },
      }),
    ).toThrow("primitive fields");
    expect(() =>
      compileForm({
        type: "object",
        properties: { x: { type: "integer", enum: ["1"] } },
      }),
    ).toThrow("must match type");
    expect(() => compileForm({ type: "object", default: null })).toThrow(
      "default must match type",
    );
  });

  test("accepts widget annotations without changing validation or default values", () => {
    const form = compileForm({
      type: "object",
      properties: {
        enabled: {
          type: "boolean",
          "x-widget": "switch",
          enum: [true],
          default: false,
        },
        priority: {
          type: "integer",
          "x-widget": "radio-group",
          enum: [0, 1],
          default: 0,
        },
        flags: {
          type: "array",
          "x-widget": "checkbox-group",
          uniqueItems: true,
          items: { type: "boolean", enum: [false, true] },
          minItems: 1,
          default: [],
        },
      },
    });
    expect(form.initialValue()).toEqual({
      enabled: false,
      priority: 0,
      flags: [],
    });
    expect(form.validate(form.initialValue()).errors).toEqual({
      "/enabled": "must be equal to one of the allowed values",
      "/flags": "must NOT have fewer than 1 items",
    });
    expect(
      form.validate({ enabled: true, priority: 1, flags: [false] }).valid,
    ).toBe(true);
    expect(
      form.validate({ enabled: true, priority: 1, flags: [false, false] })
        .valid,
    ).toBe(false);
    expect(
      form.validate({ enabled: true, priority: "1", flags: [false] } as never)
        .valid,
    ).toBe(false);
  });

  test.each([
    [{ type: "boolean", "x-widget": "toggle" }, "unsupported x-widget"],
    [{ type: "string", "x-widget": "switch" }, "switch requires type: boolean"],
    [
      { type: "string", "x-widget": "radio-group" },
      "radio-group requires a primitive enum",
    ],
    [
      { type: "boolean", "x-widget": "checkbox-group" },
      "checkbox-group requires type: array",
    ],
    [
      {
        type: "array",
        "x-widget": "checkbox-group",
        items: { type: "string", enum: ["a"] },
      },
      "checkbox-group requires uniqueItems: true",
    ],
    [
      {
        type: "array",
        "x-widget": "checkbox-group",
        uniqueItems: true,
        items: { type: "string" },
      },
      "checkbox-group requires a primitive items enum",
    ],
    [
      {
        type: "array",
        "x-widget": "checkbox-group",
        uniqueItems: true,
        items: { type: "boolean", enum: [false, true], "x-widget": "switch" },
      },
      "checkbox-group items must not specify x-widget",
    ],
  ])(
    "rejects incompatible widgets at the schema location: %j",
    (field, message) => {
      expect(() =>
        compileForm({ type: "object", properties: { field } }),
      ).toThrow(`schema/properties/field: ${message}`);
    },
  );

  test("preserves checkbox defaults outside the enum for editable validation", () => {
    const form = compileForm({
      type: "object",
      properties: {
        choices: {
          type: "array",
          "x-widget": "checkbox-group",
          uniqueItems: true,
          items: { type: "number", enum: [0, 1], minimum: 1 },
          default: [0, 9],
        },
      },
    });
    expect(form.initialValue()).toEqual({ choices: [0, 9] });
    expect(Object.keys(form.validate(form.initialValue()).errors)).toEqual([
      "/choices/0",
      "/choices/1",
    ]);
  });
});
