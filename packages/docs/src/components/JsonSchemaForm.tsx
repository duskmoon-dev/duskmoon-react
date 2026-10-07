import React, { useId, useRef, useState } from "react";
import { Button } from "@duskmoon-dev/components/button";
import { Checkbox } from "@duskmoon-dev/components/checkbox";
import { Form } from "@duskmoon-dev/components/form";
import { Radio } from "@duskmoon-dev/components/radio";
import { Switch } from "@duskmoon-dev/components/switch";
import { Input } from "@duskmoon-dev/components/input";
import { JsonSchemaWidget, specializedWidgets } from "./JsonSchemaWidget";
import { naturalWidgetValue, optionsFor } from "../lib/json-form-widgets";
import type {
  CompiledForm,
  RenderableSchema,
  FormValue,
  JsonValue,
} from "../lib/json-schema-form";

type Path = (string | number)[];
const pointer = (path: Path) =>
  path
    .map(
      (part) => `/${String(part).replaceAll("~", "~0").replaceAll("/", "~1")}`,
    )
    .join("");
const copy = (value: FormValue): FormValue =>
  JSON.parse(JSON.stringify(value)) as FormValue;

function update(
  value: FormValue,
  path: Path,
  next: JsonValue | undefined,
): FormValue {
  const result = copy(value);
  let parent: Record<string, JsonValue> | JsonValue[] = result;
  for (const [index, part] of path.slice(0, -1).entries()) {
    const child = (parent as Record<string, JsonValue>)[String(part)];
    if (child === undefined || child === null)
      (parent as Record<string, JsonValue>)[String(part)] =
        typeof path[index + 1] === "number" ? [] : {};
    parent = (parent as Record<string, JsonValue>)[
      String(part)
    ] as typeof parent;
  }
  const last = path.at(-1)!;
  if (next === undefined) {
    if (Array.isArray(parent)) parent[Number(last)] = null;
    else delete parent[String(last)];
  } else {
    (parent as Record<string, JsonValue>)[String(last)] = next;
  }
  return result;
}

function removeItem(value: FormValue, path: Path): FormValue {
  const result = copy(value);
  let parent: Record<string, JsonValue> | JsonValue[] = result;
  for (const part of path.slice(0, -1))
    parent = (parent as Record<string, JsonValue>)[
      String(part)
    ] as typeof parent;
  if (Array.isArray(parent)) parent.splice(Number(path.at(-1)), 1);
  return result;
}

function newItem(schema: RenderableSchema): JsonValue {
  if (schema.default !== undefined)
    return JSON.parse(JSON.stringify(schema.default)) as JsonValue;
  const natural = naturalWidgetValue(schema);
  if (natural !== undefined) return natural;
  if (schema.type === "object") {
    const result: FormValue = {};
    for (const [name, child] of Object.entries(schema.properties ?? {})) {
      if (
        child.default !== undefined ||
        child.type === "object" ||
        child.type === "array" ||
        child.type === "boolean" ||
        naturalWidgetValue(child) !== undefined
      )
        result[name] = newItem(child);
    }
    return result;
  }
  if (schema.type === "array") return [];
  if (schema.type === "boolean") return false;
  if (schema.type === "number" || schema.type === "integer") return 0;
  return "";
}

export function JsonSchemaForm({
  compiled,
  onSubmit,
  onReset,
}: {
  compiled: CompiledForm;
  onSubmit: (value: FormValue) => void;
  onReset?: () => void;
}) {
  const [value, setValue] = useState<FormValue>(() => compiled.initialValue());
  const [resetRevision, setResetRevision] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);
  const idPrefix = useId().replaceAll(":", "");

  function change(path: Path, next: JsonValue | undefined) {
    setValue((current) => update(current, path, next));
    setErrors({});
  }

  function remove(path: Path) {
    setValue((current) => removeItem(current, path));
    setErrors({});
  }

  function field(
    schema: RenderableSchema,
    path: Path,
    fallback: string,
    current: JsonValue | undefined,
    required = false,
  ): React.ReactNode {
    const key = pointer(path);
    const id = `${idPrefix}-${path.map((part) => Array.from(String(part), (character) => character.codePointAt(0)!.toString(16)).join("_")).join("-")}`;
    const label = schema.title ?? fallback;
    const widget = schema["x-widget"];
    const error =
      errors[key] ??
      (widget === "checkbox-group" || (widget && specializedWidgets.has(widget))
        ? Object.entries(errors).find(([path]) =>
            path.startsWith(`${key}/`),
          )?.[1]
        : undefined);
    const errorId = `${id}-error`;
    const descriptionId = `${id}-description`;
    const describedBy =
      [schema.description ? descriptionId : "", error ? errorId : ""]
        .filter(Boolean)
        .join(" ") || undefined;

    if (schema.type === "object") {
      const object =
        current && !Array.isArray(current) && typeof current === "object"
          ? (current as FormValue)
          : {};
      return (
        <fieldset className="schema-field schema-object" key={key}>
          {path.length > 0 ? (
            <legend className={required ? "schema-required" : undefined}>
              {label}
            </legend>
          ) : null}
          {schema.description ? (
            <p className="schema-description">{schema.description}</p>
          ) : null}
          {Object.entries(schema.properties ?? {}).map(([name, child]) =>
            field(
              child,
              [...path, name],
              name,
              object[name],
              schema.required?.includes(name),
            ),
          )}
          {error ? (
            <p className="schema-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </fieldset>
      );
    }
    if (widget && specializedWidgets.has(widget)) {
      return (
        <fieldset
          className="schema-field schema-specialized-field"
          key={key}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        >
          <legend className={required ? "schema-required" : undefined}>
            {label}
          </legend>
          {schema.description ? (
            <p id={descriptionId} className="schema-description">
              {schema.description}
            </p>
          ) : null}
          <JsonSchemaWidget
            key={resetRevision}
            schema={schema}
            value={current}
            onChange={(next) => change(path, next)}
            id={id}
            label={label}
            path={key}
            describedBy={describedBy}
            invalid={Boolean(error)}
          />
          {error ? (
            <p id={errorId} className="schema-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </fieldset>
      );
    }
    if (
      widget === "radio" ||
      widget === "radio-group" ||
      widget === "checkbox-group"
    ) {
      const isRadio = widget === "radio" || widget === "radio-group";
      const orientation =
        widget === "radio"
          ? undefined
          : (schema["x-widget-options"]?.orientation ?? "vertical");
      const entries = Array.isArray(current) ? current : [];
      const options = isRadio ? schema.enum! : schema.items!.enum!;
      // Constraint-invalid defaults stay visible and removable instead of disappearing.
      const invalidEntries = isRadio
        ? []
        : entries.filter(
            (entry) => !options.some((option) => Object.is(option, entry)),
          );
      return (
        <fieldset
          className={`schema-field schema-choice-group${orientation ? ` schema-choice-${orientation}` : ""}`}
          key={key}
          role={isRadio ? "radiogroup" : "group"}
          aria-orientation={isRadio ? orientation : undefined}
          aria-labelledby={`${id}-legend`}
          aria-required={isRadio ? required : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        >
          <legend
            id={`${id}-legend`}
            className={required ? "schema-required" : undefined}
          >
            {label}
          </legend>
          {schema.description ? (
            <p id={descriptionId} className="schema-description">
              {schema.description}
            </p>
          ) : null}
          <div className="schema-choice-options">
            {options.map((option, index) =>
              isRadio ? (
                <Radio
                  key={index}
                  id={`${id}-${index}`}
                  name={id}
                  value={index}
                  disabled={
                    optionsFor(schema).find((entry) =>
                      Object.is(entry.value, option),
                    )?.disabled
                  }
                  checked={Object.is(current, option)}
                  data-field-path={key}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy}
                  error={Boolean(error)}
                  onChange={() => change(path, option)}
                >
                  {optionsFor(schema).find((entry) =>
                    Object.is(entry.value, option),
                  )?.label ?? String(option)}
                </Radio>
              ) : (
                <Checkbox
                  key={index}
                  id={`${id}-${index}`}
                  name={id}
                  value={index}
                  disabled={
                    optionsFor(schema).find((entry) =>
                      Object.is(entry.value, option),
                    )?.disabled
                  }
                  checked={entries.some((entry) => Object.is(entry, option))}
                  data-field-path={key}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy}
                  error={Boolean(error)}
                  onChange={(event) =>
                    change(
                      path,
                      event.currentTarget.checked
                        ? [...entries, option]
                        : entries.filter((entry) => !Object.is(entry, option)),
                    )
                  }
                >
                  {optionsFor(schema).find((entry) =>
                    Object.is(entry.value, option),
                  )?.label ?? String(option)}
                </Checkbox>
              ),
            )}
            {invalidEntries.map((entry, index) => (
              <Checkbox
                key={`invalid-${index}`}
                name={id}
                checked
                data-field-path={key}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                error={Boolean(error)}
                onChange={() =>
                  change(
                    path,
                    entries.filter((item) => !Object.is(item, entry)),
                  )
                }
              >
                {String(entry)} (not an option)
              </Checkbox>
            ))}
          </div>
          {error ? (
            <p id={errorId} className="schema-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </fieldset>
      );
    }
    if (schema.type === "array") {
      const entries = Array.isArray(current) ? current : [];
      return (
        <fieldset className="schema-field schema-array" key={key}>
          <legend className={required ? "schema-required" : undefined}>
            {label}
          </legend>
          {schema.description ? (
            <p className="schema-description">{schema.description}</p>
          ) : null}
          {entries.map((entry, index) => (
            <div className="schema-array-item" key={index}>
              {field(
                schema.items!,
                [...path, index],
                `${label} ${index + 1}`,
                entry,
              )}
              <Button
                type="button"
                appearance="ghost"
                color="error"
                shape="square"
                className="schema-array-remove"
                onClick={() => remove([...path, index])}
                aria-label={`Remove ${label} ${index + 1}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
                </svg>
              </Button>
            </div>
          ))}
          <Button
            type="button"
            appearance="outline"
            onClick={() => change(path, [...entries, newItem(schema.items!)])}
            disabled={
              schema.maxItems !== undefined && entries.length >= schema.maxItems
            }
          >
            Add {label}
          </Button>
          {error ? (
            <p className="schema-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </fieldset>
      );
    }

    const standaloneCheckbox =
      schema.type === "boolean" &&
      widget !== "switch" &&
      (!schema.enum || widget === "checkbox");
    let control: React.ReactNode;
    if (widget === "switch") {
      control = (
        <Switch
          id={id}
          data-field-path={key}
          checked={current === true}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          color={error ? "error" : "primary"}
          onChange={(checked) => change(path, checked)}
        />
      );
    } else if (schema.enum && widget !== "checkbox") {
      const selected = schema.enum.findIndex((option) =>
        Object.is(option, current),
      );
      control = (
        <select
          id={id}
          className="input"
          value={selected < 0 ? "" : String(selected)}
          data-field-path={key}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) =>
            change(
              path,
              event.currentTarget.value === ""
                ? undefined
                : schema.enum![Number(event.currentTarget.value)],
            )
          }
        >
          <option value="">Choose {label}</option>
          {schema.enum.map((option, index) => (
            <option key={index} value={index}>
              {String(option)}
            </option>
          ))}
        </select>
      );
    } else if (schema.type === "boolean") {
      control = (
        <Checkbox
          id={id}
          data-field-path={key}
          checked={current === true}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => change(path, event.currentTarget.checked)}
        >
          {required ? (
            <span className="schema-required" aria-hidden="true" />
          ) : null}
          {label}
        </Checkbox>
      );
    } else if (schema.type === "number" || schema.type === "integer") {
      control = (
        <Input
          id={id}
          data-field-path={key}
          type="number"
          step={schema.type === "integer" ? "1" : "any"}
          value={typeof current === "number" ? String(current) : ""}
          status={error ? "error" : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => {
            const text = event.currentTarget.value;
            change(path, text === "" ? undefined : Number(text));
          }}
        />
      );
    } else {
      control = (
        <Input
          id={id}
          data-field-path={key}
          type="text"
          value={typeof current === "string" ? current : ""}
          status={error ? "error" : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => change(path, event.currentTarget.value)}
        />
      );
    }
    return (
      <Form.Item
        key={key}
        label={standaloneCheckbox ? undefined : label}
        required={required}
        className={error ? "form-item-error" : undefined}
        extra={
          schema.description ? (
            <p id={descriptionId}>{schema.description}</p>
          ) : null
        }
        help={
          error ? (
            <p id={errorId} className="schema-field-error" role="alert">
              {error}
            </p>
          ) : null
        }
      >
        {control}
      </Form.Item>
    );
  }

  function reset() {
    setResetRevision((revision) => revision + 1);
    setValue(compiled.initialValue());
    setErrors({});
    onReset?.();
  }

  function submit() {
    const result = compiled.validate(value);
    setErrors(result.errors);
    if (result.valid) onSubmit(copy(value));
    else {
      const first = Object.keys(result.errors)[0];
      const controls = Array.from(
        formRef.current?.querySelectorAll<HTMLElement>("[data-field-path]") ??
          [],
      );
      const target =
        controls.find((element) => element.dataset.fieldPath === first) ??
        controls
          .filter((element) =>
            first.startsWith(`${element.dataset.fieldPath}/`),
          )
          .sort(
            (a, b) => b.dataset.fieldPath!.length - a.dataset.fieldPath!.length,
          )[0];
      const focusable = target?.matches(
        "input:not([type=hidden]):not([hidden]), textarea, select, button",
      )
        ? target
        : target?.querySelector<HTMLElement>(
            "button:not(:disabled), input:not([type=hidden]):not([hidden]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex='0']",
          );
      focusable?.focus();
    }
  }

  const rootError = errors[""] ? <p role="alert">{errors[""]}</p> : null;
  return (
    <div ref={formRef} className="schema-form-container">
      <form
        className="form form-vertical schema-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {field(compiled.schema, [], "Form", value)}
        {rootError}
        <div className="schema-form-actions">
          <Button color="primary" type="submit">
            Submit
          </Button>
          <Button type="button" appearance="outline" onClick={reset}>
            Reset form
          </Button>
        </div>
      </form>
    </div>
  );
}
