import type { JsonValue, RenderableSchema } from "./json-schema-form";

export const widgetNames = [
  "input",
  "input-number",
  "checkbox",
  "radio",
  "radio-group",
  "checkbox-group",
  "color-picker",
  "date-picker",
  "dm-date-picker",
  "mentions",
  "otp-input",
  "rate",
  "segmented",
  "select",
  "slider",
  "switch",
  "time-picker",
  "transfer",
  "tree-select",
  "cascader",
  "upload",
] as const;
export type WidgetName = (typeof widgetNames)[number];
export type WidgetOption = {
  value: string | number | boolean;
  label: string;
  children?: WidgetOption[];
  disabled?: boolean;
};
export type OrientationWidgetConfig = {
  orientation?: "horizontal" | "vertical";
};
export type WidgetConfig = OrientationWidgetConfig & {
  length?: number;
  count?: number;
  allowHalf?: boolean;
  min?: number;
  max?: number;
  step?: number;
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const matches = (type: string, value: unknown) =>
  type === "integer"
    ? typeof value === "number" && Number.isInteger(value)
    : typeof value === type;
const numeric = (type: string) => type === "number" || type === "integer";
const same = (a: unknown, b: unknown) => Object.is(a, b);
export const flattenOptions = (options: WidgetOption[]): WidgetOption[] =>
  options.flatMap((option) => [
    option,
    ...flattenOptions(option.children ?? []),
  ]);

export function widgetConfig(schema: RenderableSchema): WidgetConfig {
  if (schema["x-widget"] === "slider") {
    return {
      min: schema.minimum ?? 0,
      max: schema.maximum ?? 100,
      step: schema.multipleOf ?? 1,
      ...schema["x-widget-options"],
    };
  }
  return schema["x-widget-options"] ?? {};
}

export function naturalWidgetValue(
  schema: RenderableSchema,
): JsonValue | undefined {
  switch (schema["x-widget"]) {
    case "rate":
      return 0;
    case "slider":
      return widgetConfig(schema).min!;
    case "segmented":
      return optionsFor(schema).find((option) => !option.disabled)?.value;
    case "color-picker":
      return "#000000";
    default:
      return undefined;
  }
}

export function optionsFor(schema: RenderableSchema): WidgetOption[] {
  if (schema["x-options"]) return schema["x-options"];
  return (schema.enum ?? schema.items?.enum ?? []).map((value) => ({
    value: value as string | number | boolean,
    label: String(value),
  }));
}

export function inspectWidgets(
  input: Record<string, unknown>,
  location: string,
): void {
  const schema = input as unknown as RenderableSchema;
  const widget = schema["x-widget"];
  const fail = (message: string): never => {
    throw new Error(`${location}: ${message}`);
  };
  if (widget === undefined) {
    if (
      input["x-options"] !== undefined ||
      input["x-widget-options"] !== undefined
    )
      fail("widget annotations require x-widget");
    return;
  }
  if (!widgetNames.includes(widget))
    fail(`unsupported x-widget "${String(widget)}"`);
  const type = schema.type;
  const isEnum = schema.enum !== undefined;
  const item = schema.items;
  const arrayChoice = type === "array" && item?.enum !== undefined;
  const requireArrayChoice = () => {
    if (type !== "array") fail(`${widget} requires type: array`);
    if (input.uniqueItems !== true)
      fail(`${widget} requires uniqueItems: true`);
    if (!item?.enum) fail(`${widget} requires a primitive items enum`);
    if (item?.["x-widget"]) fail(`${widget} items must not specify x-widget`);
    if (item?.["x-options"] || item?.["x-widget-options"])
      fail(`${widget} items must not specify x-widget`);
  };
  switch (widget) {
    case "input":
      if (type !== "string" || isEnum)
        fail("input requires a string without enum");
      break;
    case "input-number":
    case "rate":
    case "slider":
      if (!numeric(type) || isEnum)
        fail(`${widget} requires number or integer without enum`);
      break;
    case "checkbox":
    case "switch":
      if (type !== "boolean") fail(`${widget} requires type: boolean`);
      break;
    case "radio":
    case "radio-group":
    case "segmented":
      if (!isEnum) fail(`${widget} requires a primitive enum`);
      break;
    case "select":
      if (type === "array") requireArrayChoice();
      else if (!isEnum)
        fail("select requires a primitive enum or unique enum array");
      break;
    case "checkbox-group":
    case "transfer":
      requireArrayChoice();
      if (widget === "transfer" && item?.type !== "string")
        fail("transfer requires string items");
      break;
    case "tree-select":
      if (type === "array") requireArrayChoice();
      if (!(
        type === "string" ||
        numeric(type) ||
        (arrayChoice && (item?.type === "string" || numeric(item!.type)))
      ))
        fail("tree-select requires string or number enum values");
      if (!isEnum && !arrayChoice) fail("tree-select requires an enum");
      break;
    case "cascader":
      if (
        type !== "array" ||
        !item?.enum ||
        !(item.type === "string" || numeric(item.type))
      )
        fail(
          "cascader requires a homogeneous string or number path array with items.enum",
        );
      if (
        item?.["x-widget"] ||
        item?.["x-options"] ||
        item?.["x-widget-options"]
      )
        fail("cascader items must not specify widget annotations");
      break;
    case "upload": {
      if (
        type !== "array" ||
        input.uniqueItems !== true ||
        item?.type !== "object"
      )
        fail("upload requires a unique array of metadata objects");
      const fields = {
        name: "string",
        size: "integer",
        type: "string",
        lastModified: "integer",
      };
      if (
        Object.keys(item!.properties ?? {}).length !== 4 ||
        item!.required?.length !== 4 ||
        !Object.entries(fields).every(
          ([key, fieldType]) =>
            item!.properties?.[key]?.type === fieldType &&
            item!.required?.includes(key),
        )
      )
        fail(
          "upload items require name, size, type, lastModified with canonical string/integer types",
        );
      if (
        [item!, ...Object.values(item!.properties ?? {})].some((field) =>
          ["x-widget", "x-options", "x-widget-options"].some((key) =>
            Object.hasOwn(field, key),
          ),
        )
      )
        fail("upload items must not specify widget annotations");
      break;
    }
    default:
      if (type !== "string" || isEnum)
        fail(`${widget} requires string without enum`);
  }
  const optionWidgets = [
    "radio",
    "radio-group",
    "checkbox-group",
    "segmented",
    "select",
    "tree-select",
    "cascader",
    "transfer",
    "mentions",
  ];
  const hierarchy = widget === "tree-select" || widget === "cascader";
  if (hierarchy && input["x-options"] === undefined)
    fail(`${widget} requires x-options hierarchy`);
  if (input["x-options"] !== undefined) {
    if (!optionWidgets.includes(widget))
      fail(`${widget} does not accept x-options`);
    const optionType =
      widget === "mentions" ? "string" : type === "array" ? item!.type : type;
    const seen: unknown[] = [];
    function walk(options: unknown, path: string) {
      if (!Array.isArray(options) || options.length === 0)
        throw new Error(`${path}: expected nonempty options array`);
      options.forEach((option, index) => {
        const at = `${path}/${index}`;
        if (!isRecord(option)) throw new Error(`${at}: expected option object`);
        for (const key of Object.keys(option))
          if (!["value", "label", "children", "disabled"].includes(key))
            throw new Error(`${at}: unsupported option key "${key}"`);
        if (
          !matches(optionType, option.value) ||
          (typeof option.value === "number" && !Number.isFinite(option.value))
        )
          throw new Error(`${at}/value: option must match type: ${optionType}`);
        if (typeof option.label !== "string")
          throw new Error(`${at}/label: expected string`);
        if (
          option.disabled !== undefined &&
          typeof option.disabled !== "boolean"
        )
          throw new Error(`${at}/disabled: expected boolean`);
        if (seen.some((value) => same(value, option.value)))
          throw new Error(`${at}/value: option values must be globally unique`);
        seen.push(option.value);
        if (option.children !== undefined) {
          if (!hierarchy)
            throw new Error(
              `${at}/children: hierarchy is not supported by ${widget}`,
            );
          walk(option.children, `${at}/children`);
        }
      });
    }
    walk(input["x-options"], `${location}/x-options`);
    if (widget !== "mentions") {
      const allowed = schema.enum ?? item?.enum ?? [];
      if (
        allowed.length !== seen.length ||
        !allowed.every((value) => seen.some((option) => same(value, option)))
      )
        fail("x-options must cover enum values exactly");
    }
  }
  if (
    widget === "segmented" &&
    !optionsFor(schema).some((option) => !option.disabled)
  )
    fail("segmented needs an enabled option");
  if (input["x-widget-options"] !== undefined) {
    const config = input["x-widget-options"];
    if (!isRecord(config)) fail("x-widget-options must be an object");
    const keys =
      widget === "otp-input"
        ? ["length"]
        : widget === "rate"
          ? ["count", "allowHalf"]
          : widget === "slider"
            ? ["min", "max", "step"]
            : widget === "radio-group" || widget === "checkbox-group"
              ? ["orientation"]
              : [];
    for (const key of Object.keys(config as Record<string, unknown>)) {
      if (!keys.includes(key)) fail(`unsupported ${widget} option "${key}"`);
      const value = (config as Record<string, unknown>)[key];
      if (key === "orientation") {
        if (value !== "horizontal" && value !== "vertical")
          fail("orientation must be horizontal or vertical");
      } else if (key === "allowHalf") {
        if (typeof value !== "boolean") fail("allowHalf must be boolean");
      } else if (typeof value !== "number" || !Number.isFinite(value))
        fail(`${key} must be finite number`);
    }
    if (keys.length === 0) fail(`${widget} does not accept x-widget-options`);
  }
  const config = widgetConfig(schema);
  if (
    widget === "otp-input" &&
    (!Number.isInteger(config.length ?? 6) ||
      (config.length ?? 6) < 1 ||
      (config.length ?? 6) > 8)
  )
    fail("otp-input length must be an integer from 1 to 8");
  if (widget === "rate") {
    if (
      !Number.isInteger(config.count ?? 5) ||
      (config.count ?? 5) < 1 ||
      (config.count ?? 5) > 20
    )
      fail("rate count must be an integer from 1 to 20");
    if (type === "integer" && config.allowHalf)
      fail("integer rate must not allowHalf");
  }
  if (widget === "slider") {
    if (
      ![config.min, config.max, config.step].every(
        (value) => typeof value === "number" && Number.isFinite(value),
      ) ||
      config.min! >= config.max! ||
      config.step! <= 0
    )
      fail("slider requires finite min < max and positive step");
    if (
      type === "integer" &&
      ![config.min, config.max, config.step].every(Number.isInteger)
    )
      fail("integer slider requires integer bounds and step");
  }
}

export function widgetValueError(
  schema: RenderableSchema,
  value: JsonValue,
): string | undefined {
  switch (schema["x-widget"]) {
    case "color-picker":
      if (typeof value !== "string" || !/^#[0-9a-f]{6}$/i.test(value))
        return "must be a six-digit hex color";
      break;
    case "date-picker":
    case "dm-date-picker": {
      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(`${value}T00:00:00Z`)) ||
        new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
      )
        return "must be a valid date in YYYY-MM-DD format";
      break;
    }
    case "time-picker":
      if (
        typeof value !== "string" ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value)
      )
        return "must be local time in HH:mm:ss format";
      break;
    case "otp-input":
      if (
        typeof value !== "string" ||
        !new RegExp(`^\\d{${widgetConfig(schema).length ?? 6}}$`).test(value)
      )
        return "must contain the configured number of digits";
      break;
    case "cascader": {
      if (!Array.isArray(value)) return "must be a selected hierarchy path";
      if (value.length === 0) return undefined;
      let options = schema["x-options"]!;
      let leaf = false;
      for (const part of value) {
        const option = options.find((option) => same(option.value, part));
        if (!option || option.disabled)
          return "must be an enabled hierarchy path";
        options = option.children ?? [];
        leaf = options.length === 0;
      }
      if (!leaf) return "must select a complete hierarchy path";
      break;
    }
  }
  return undefined;
}
