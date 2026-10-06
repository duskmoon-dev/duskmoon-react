import Ajv2020, {
  type AnySchema,
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  inspectWidgets,
  naturalWidgetValue,
  widgetValueError,
  type WidgetName,
  type WidgetOption,
  type WidgetConfig,
} from "./json-form-widgets";

export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type FormValue = { [key: string]: JsonValue };
export type RenderableSchema = {
  type: "object" | "array" | "string" | "number" | "integer" | "boolean";
  title?: string;
  description?: string;
  default?: JsonValue;
  enum?: JsonValue[];
  properties?: Record<string, RenderableSchema>;
  required?: string[];
  items?: RenderableSchema;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  "x-widget"?: WidgetName;
  "x-options"?: WidgetOption[];
  "x-widget-options"?: WidgetConfig;
};

export type CompiledForm = {
  schema: RenderableSchema;
  initialValue: () => FormValue;
  validate: (value: FormValue) => {
    valid: boolean;
    errors: Record<string, string>;
  };
};

const keywords = new Set([
  "$schema",
  "$id",
  "$comment",
  "title",
  "description",
  "default",
  "type",
  "x-widget",
  "x-options",
  "x-widget-options",
  "enum",
  "properties",
  "required",
  "additionalProperties",
  "items",
  "minLength",
  "maxLength",
  "pattern",
  "format",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minItems",
  "maxItems",
  "uniqueItems",
  "minProperties",
  "maxProperties",
]);
const dangerousNames = new Set(["__proto__", "prototype", "constructor"]);
const primitive = (value: unknown): value is null | string | number | boolean =>
  value === null ||
  typeof value === "string" ||
  typeof value === "boolean" ||
  (typeof value === "number" && Number.isFinite(value));
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const pointer = (part: string) =>
  part.replaceAll("~", "~0").replaceAll("/", "~1");

function inspectDefault(
  schema: RenderableSchema,
  value: unknown,
  location: string,
): void {
  const matches =
    schema.type === "object"
      ? record(value)
      : schema.type === "array"
        ? Array.isArray(value)
        : schema.type === "integer"
          ? typeof value === "number" && Number.isInteger(value)
          : typeof value === schema.type;
  if (!matches)
    throw new Error(`${location}: default must match type: ${schema.type}`);

  // Missing fields and constraint violations remain editable form values.
  if (schema.type === "object" && record(value)) {
    for (const [name, child] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, name))
        inspectDefault(child, value[name], `${location}/${pointer(name)}`);
    }
  } else if (schema.type === "array" && Array.isArray(value)) {
    value.forEach((item, index) =>
      inspectDefault(schema.items!, item, `${location}/${index}`),
    );
  }
}

function inspect(schema: unknown, location: string): RenderableSchema {
  if (!record(schema)) throw new Error(`${location}: expected a schema object`);
  for (const key of Object.keys(schema)) {
    if (!keywords.has(key))
      throw new Error(`${location}: unsupported keyword "${key}"`);
  }
  const type = schema.type;
  if (
    !["object", "array", "string", "number", "integer", "boolean"].includes(
      type as string,
    )
  ) {
    throw new Error(
      `${location}: expected one supported type (object, array, string, number, integer, boolean)`,
    );
  }
  if (
    schema.enum !== undefined &&
    (!Array.isArray(schema.enum) ||
      schema.enum.length === 0 ||
      !schema.enum.every(primitive))
  ) {
    throw new Error(`${location}: enum must contain JSON primitive values`);
  }
  if (schema.enum !== undefined) {
    if (type === "object" || type === "array")
      throw new Error(
        `${location}: enum is supported only for primitive fields`,
      );
    for (const option of schema.enum as (null | string | number | boolean)[]) {
      const matches =
        type === "integer"
          ? typeof option === "number" && Number.isInteger(option)
          : typeof option === type;
      if (!matches)
        throw new Error(`${location}: enum values must match type: ${type}`);
    }
  }
  if (
    schema.$schema !== undefined &&
    schema.$schema !== "https://json-schema.org/draft/2020-12/schema"
  )
    throw new Error(`${location}: only JSON Schema draft 2020-12 is supported`);
  if (schema.type === "object") {
    if (schema.properties !== undefined && !record(schema.properties))
      throw new Error(`${location}: properties must be an object`);
    if (
      schema.required !== undefined &&
      (!Array.isArray(schema.required) ||
        !schema.required.every((name) => typeof name === "string"))
    )
      throw new Error(
        `${location}: required must be an array of property names`,
      );
    for (const [name, child] of Object.entries(schema.properties ?? {})) {
      if (dangerousNames.has(name))
        throw new Error(`${location}: unsafe property name "${name}"`);
      inspect(child, `${location}/properties/${pointer(name)}`);
    }
    for (const name of (schema.required ?? []) as string[]) {
      if (dangerousNames.has(name))
        throw new Error(`${location}: unsafe required property "${name}"`);
      if (!Object.hasOwn(schema.properties ?? {}, name))
        throw new Error(
          `${location}: required property "${name}" has no rendered field`,
        );
    }
    if (
      schema.additionalProperties !== undefined &&
      schema.additionalProperties !== false
    )
      throw new Error(
        `${location}: only additionalProperties: false is supported`,
      );
  } else if (
    schema.properties !== undefined ||
    schema.required !== undefined ||
    schema.additionalProperties !== undefined
  ) {
    throw new Error(`${location}: object keywords require type: object`);
  }
  if (schema.type === "array") {
    if (!record(schema.items))
      throw new Error(
        `${location}: items must be one homogeneous schema object`,
      );
    inspect(schema.items, `${location}/items`);
  } else if (schema.items !== undefined) {
    throw new Error(`${location}: items requires type: array`);
  }
  inspectWidgets(schema, location);
  if (schema.default !== undefined) {
    try {
      clone(schema.default);
    } catch {
      throw new Error(`${location}: default must be JSON compatible`);
    }
    inspectDefault(
      schema as RenderableSchema,
      schema.default,
      `${location}/default`,
    );
  }
  return schema as RenderableSchema;
}

function initial(schema: RenderableSchema): JsonValue | undefined {
  if (schema.default !== undefined) return clone(schema.default);
  const widgetValue = naturalWidgetValue(schema);
  if (widgetValue !== undefined) return widgetValue;
  if (schema.type === "boolean") return false;
  if (schema.type === "array") return [];
  if (schema.type === "object") {
    const value: FormValue = {};
    for (const [name, child] of Object.entries(schema.properties ?? {})) {
      const childValue = initial(child);
      if (childValue !== undefined) value[name] = childValue;
    }
    return value;
  }
  return undefined;
}

function errorPath(error: ErrorObject): string {
  if (error.keyword === "required")
    return `${error.instancePath}/${pointer(String(error.params.missingProperty))}`;
  if (error.keyword === "additionalProperties")
    return `${error.instancePath}/${pointer(String(error.params.additionalProperty))}`;
  return error.instancePath;
}

export function compileForm(input: unknown): CompiledForm {
  const schema = inspect(input, "schema");
  if (schema.type !== "object")
    throw new Error("schema: root type must be object");
  // Do not let Ajv alter submitted values: all control decoding happens in the renderer.
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    useDefaults: false,
    coerceTypes: false,
    removeAdditional: false,
  });
  addFormats(ajv);
  for (const [keyword, schemaType] of [
    ["x-widget", "string"],
    ["x-options", "array"],
    ["x-widget-options", "object"],
  ] as const)
    ajv.addKeyword({ keyword, schemaType, valid: true });
  let validate: ValidateFunction<FormValue>;
  try {
    validate = ajv.compile<FormValue>(input as AnySchema);
  } catch (error) {
    throw new Error(
      `Invalid JSON Schema: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
  return {
    schema,
    initialValue: () => initial(schema) as FormValue,
    validate(value) {
      const valid = validate(value);
      const errors: Record<string, string> = {};
      for (const error of validate.errors ?? []) {
        const path = errorPath(error);
        if (!errors[path]) errors[path] = error.message ?? "Invalid value";
      }
      function inspectValue(
        node: RenderableSchema,
        candidate: JsonValue,
        path: string,
      ) {
        const message = widgetValueError(node, candidate);
        if (message && !errors[path]) errors[path] = message;
        if (node.type === "object" && record(candidate)) {
          for (const [name, child] of Object.entries(node.properties ?? {}))
            if (Object.hasOwn(candidate, name))
              inspectValue(
                child,
                candidate[name] as JsonValue,
                `${path}/${pointer(name)}`,
              );
        } else if (node.type === "array" && Array.isArray(candidate)) {
          candidate.forEach((entry, index) =>
            inspectValue(node.items!, entry, `${path}/${index}`),
          );
        }
      }
      inspectValue(schema, value, "");
      return {
        valid: Boolean(valid) && Object.keys(errors).length === 0,
        errors,
      };
    },
  };
}
