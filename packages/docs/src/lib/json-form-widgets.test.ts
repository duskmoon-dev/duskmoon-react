import { describe, expect, test } from "bun:test";
import { compileForm } from "./json-schema-form";

const compile = (field: object) =>
  compileForm({ type: "object", properties: { field } });
const tree = [
  { value: 1, label: "Parent", children: [{ value: 2, label: "Leaf" }] },
];
export const uploadItems = {
  type: "object",
  additionalProperties: false,
  required: ["name", "size", "type", "lastModified"],
  properties: {
    name: { type: "string" },
    size: { type: "integer", minimum: 0 },
    type: { type: "string" },
    lastModified: { type: "integer", minimum: 0 },
  },
};

describe("schema widget contracts", () => {
  test.each([
    [{ type: "string", "x-widget": "input-number" }, "input-number requires"],
    [{ type: "string", "x-widget": "checkbox" }, "checkbox requires"],
    [{ type: "string", "x-options": [] }, "widget annotations require"],
    [
      { type: "string", "x-widget": "date-picker", "x-widget-options": {} },
      "does not accept",
    ],
    [
      {
        type: "string",
        "x-widget": "otp-input",
        "x-widget-options": { length: 9 },
      },
      "length must",
    ],
    [
      {
        type: "string",
        "x-widget": "otp-input",
        "x-widget-options": { placeholder: "code" },
      },
      "unsupported otp-input option",
    ],
    [
      { type: "number", "x-widget": "rate", "x-widget-options": { count: 21 } },
      "count must",
    ],
    [
      {
        type: "integer",
        "x-widget": "rate",
        "x-widget-options": { allowHalf: true },
      },
      "must not allowHalf",
    ],
    [
      {
        type: "number",
        "x-widget": "slider",
        "x-widget-options": { min: 10, max: 5 },
      },
      "min < max",
    ],
    [
      { type: "number", "x-widget": "slider", "x-widget-options": { step: 0 } },
      "positive step",
    ],
    [
      {
        type: "integer",
        "x-widget": "slider",
        "x-widget-options": { step: 0.5 },
      },
      "integer bounds",
    ],
    [
      { type: "string", "x-widget": "tree-select", enum: ["a"] },
      "requires x-options",
    ],
    [
      {
        type: "array",
        "x-widget": "transfer",
        uniqueItems: true,
        items: { type: "integer", enum: [1] },
      },
      "requires string items",
    ],
    [
      {
        type: "array",
        "x-widget": "select",
        items: { type: "string", enum: ["a"] },
      },
      "uniqueItems",
    ],
    [
      { type: "string", "x-layout": "dm-query" },
      'unsupported keyword "x-layout"',
    ],
  ])(
    "rejects incompatible annotations with a field path: %j",
    (schema, message) => {
      expect(() => compile(schema)).toThrow(message);
      expect(() => compile(schema)).toThrow("schema/properties/field");
    },
  );

  test.each([
    [[{ value: 1, label: "A", typo: true }]],
    [[{ value: "1", label: "Wrong type" }]],
    [[{ value: 1, label: 4 }]],
    [[{ value: 1, label: "A", disabled: "yes" }]],
    [[{ value: 1, label: "A", children: [{ value: 2, label: "B" }] }]],
    [
      [
        { value: 1, label: "A" },
        { value: 1, label: "duplicate" },
      ],
    ],
  ])(
    "rejects invalid options without silently discarding metadata: %j",
    (options) => {
      expect(() =>
        compile({
          type: "integer",
          enum: [1, 2],
          "x-widget": "select",
          "x-options": options,
        }),
      ).toThrow("schema/properties/field/x-options");
    },
  );

  test("requires exact enum coverage across the complete tree", () => {
    expect(() =>
      compile({
        type: "integer",
        enum: [1, 2, 3],
        "x-widget": "tree-select",
        "x-options": tree,
      }),
    ).toThrow("cover enum values exactly");
    const form = compile({
      type: "array",
      items: { type: "integer", enum: [1, 2] },
      "x-widget": "cascader",
      "x-options": tree,
    });
    expect(form.validate({ field: [1, 2] }).valid).toBe(true);
    expect(form.validate({ field: [2] }).errors["/field"]).toContain(
      "hierarchy path",
    );
    expect(form.validate({ field: [1] }).errors["/field"]).toContain(
      "complete",
    );
    expect(form.validate({ field: [] }).valid).toBe(true);
  });

  test.each(["parent", "leaf"])(
    "rejects Cascader paths through a disabled %s without discarding defaults",
    (disabledNode) => {
      const form = compile({
        type: "array",
        items: { type: "integer", enum: [1, 2] },
        "x-widget": "cascader",
        "x-options": [
          {
            value: 1,
            label: "Parent",
            disabled: disabledNode === "parent",
            children: [
              { value: 2, label: "Leaf", disabled: disabledNode === "leaf" },
            ],
          },
        ],
        default: [1, 2],
      });
      expect(form.initialValue()).toEqual({ field: [1, 2] });
      expect(form.validate(form.initialValue()).errors["/field"]).toContain(
        "enabled hierarchy path",
      );
      expect(form.validate({ field: [] }).valid).toBe(true);
    },
  );

  test.each([
    ["color-picker", "#abc", "#00ff00"],
    ["date-picker", "2026-02-30", "2026-02-28"],
    ["dm-date-picker", "06/10/2026", "2026-10-06"],
    ["time-picker", "25:30:00", "09:30:00"],
    ["otp-input", "12345", "001234"],
  ])(
    "validates %s domain alongside ordinary schema constraints",
    (widget, bad, good) => {
      const form = compile({ type: "string", "x-widget": widget });
      expect(form.validate({ field: bad }).errors["/field"]).toBeDefined();
      expect(form.validate({ field: good }).valid).toBe(true);
    },
  );

  test("annotations retain Ajv bounds, item errors, uniqueness and typed booleans", () => {
    const form = compile({
      type: "array",
      "x-widget": "select",
      uniqueItems: true,
      maxItems: 1,
      items: { type: "boolean", enum: [false, true] },
    });
    expect(form.validate({ field: [false] }).valid).toBe(true);
    expect(form.validate({ field: [false, false] }).valid).toBe(false);
    expect(
      form.validate({ field: ["false"] }).errors["/field/0"],
    ).toBeDefined();
    expect(
      compile({
        type: "integer",
        "x-widget": "input-number",
        minimum: 5,
      }).validate({ field: 3 }).valid,
    ).toBe(false);
    expect(
      compile({
        type: "boolean",
        "x-widget": "checkbox",
        enum: [true],
      }).validate({ field: false }).valid,
    ).toBe(false);
  });

  test("initializes natural values but preserves ancestor partial and constraint-invalid defaults", () => {
    const fields = {
      color: { type: "string", "x-widget": "color-picker" },
      score: { type: "number", "x-widget": "rate" },
      amount: {
        type: "number",
        "x-widget": "slider",
        minimum: 10,
        maximum: 20,
      },
      mode: { type: "boolean", "x-widget": "segmented", enum: [false, true] },
    };
    expect(
      compileForm({ type: "object", properties: fields }).initialValue(),
    ).toEqual({ color: "#000000", score: 0, amount: 10, mode: false });
    expect(
      compileForm({
        type: "object",
        properties: fields,
        default: {},
      }).initialValue(),
    ).toEqual({});
    const invalid = compile({
      type: "number",
      "x-widget": "rate",
      default: 99,
      maximum: 5,
    });
    expect(invalid.initialValue()).toEqual({ field: 99 });
    expect(invalid.validate(invalid.initialValue()).valid).toBe(false);
  });

  test("upload requires canonical metadata and rejects ignored nested annotations", () => {
    const schema = {
      type: "array",
      uniqueItems: true,
      "x-widget": "upload",
      items: uploadItems,
    };
    expect(
      compile(schema).validate({
        field: [
          { name: "file.txt", size: 3, type: "text/plain", lastModified: 0 },
        ],
      }).valid,
    ).toBe(true);
    expect(() =>
      compile({ ...schema, items: { ...uploadItems, required: ["name"] } }),
    ).toThrow("canonical");
    expect(() =>
      compile({
        ...schema,
        items: {
          ...uploadItems,
          properties: {
            ...uploadItems.properties,
            name: { type: "string", "x-widget": "input" },
          },
        },
      }),
    ).toThrow("must not specify widget annotations");
    expect(
      compile(schema).validate({
        field: [
          { name: "file.txt", size: -1, type: "text/plain", lastModified: 0 },
        ],
      }).errors["/field/0/size"],
    ).toBeDefined();
  });

  test.each(["form", "dm-search", "dm-query"])(
    "rejects root layout annotation %s as unsupported",
    (layout) => {
      expect(() =>
        compileForm({
          type: "object",
          "x-layout": layout,
          properties: { value: { type: "integer", default: 0 } },
        }),
      ).toThrow('schema: unsupported keyword "x-layout"');
    },
  );
});

describe("choice group orientation contracts", () => {
  const field = (widget: string) =>
    widget === "checkbox-group"
      ? {
          type: "array",
          "x-widget": widget,
          uniqueItems: true,
          items: { type: "boolean", enum: [false, true] },
          default: [false],
        }
      : { type: "integer", "x-widget": widget, enum: [0, 1], default: 0 };

  for (const widget of ["radio-group", "checkbox-group"]) {
    test.each(["horizontal", "vertical"])(
      `${widget} accepts %s without changing typed defaults or constraints`,
      (orientation) => {
        const form = compile({
          ...field(widget),
          "x-widget-options": { orientation },
        });
        expect(form.initialValue()).toEqual({
          field: widget === "checkbox-group" ? [false] : 0,
        });
        expect(form.validate(form.initialValue()).valid).toBe(true);
        expect(
          form.validate({
            field: widget === "checkbox-group" ? ["false"] : "0",
          }).valid,
        ).toBe(false);
      },
    );
    test.each(
      [null, false, 7, [], {}, "", "diagonal", "Horizontal"].map(
        (orientation) => ({ orientation }),
      ),
    )(
      `${widget} rejects invalid orientation %j at the field`,
      ({ orientation }) => {
        expect(() =>
          compile({ ...field(widget), "x-widget-options": { orientation } }),
        ).toThrow(
          "schema/properties/field: orientation must be horizontal or vertical",
        );
      },
    );
    test(`${widget} rejects unknown options and non-object config`, () => {
      expect(() =>
        compile({
          ...field(widget),
          "x-widget-options": { orientation: "horizontal", wrap: true },
        }),
      ).toThrow(`unsupported ${widget} option "wrap"`);
      expect(() =>
        compile({ ...field(widget), "x-widget-options": "horizontal" }),
      ).toThrow("x-widget-options must be an object");
    });
  }
  test.each([
    { type: "integer", "x-widget": "radio", enum: [0, 1] },
    { type: "boolean", "x-widget": "switch" },
    { type: "number", "x-widget": "rate" },
    { type: "string", "x-widget": "otp-input" },
    { type: "number", "x-widget": "slider" },
  ])("rejects orientation on unrelated widgets %j", (field) => {
    expect(() =>
      compile({ ...field, "x-widget-options": { orientation: "horizontal" } }),
    ).toThrow(`unsupported ${field["x-widget"]} option "orientation"`);
  });
});
