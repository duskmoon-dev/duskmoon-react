import React from "react";
import { Button } from "../button";
import { Cascader } from "../cascader";
import { ColorPicker } from "../color-picker";
import { DatePicker } from "../date-picker";
import { DmDatePicker } from "../dm-date-picker";
import { Input } from "../input";
import { InputNumber } from "../input-number";
import { Mentions } from "../mentions";
import { OtpInput, type OtpInputLength } from "../otp-input";
import { Rate } from "../rate";
import { Segmented } from "../segmented";
import { Select } from "../select";
import { Slider } from "../slider";
import { TimePicker } from "../time-picker";
import { Transfer } from "../transfer";
import { TreeSelect, type TreeSelectDataNode } from "../tree-select";
import { Upload, type UploadFile } from "../upload";
import {
  naturalWidgetValue,
  optionsFor,
  widgetConfig,
} from "./json-form-widgets";
import type { JsonValue, RenderableSchema } from "./json-schema-form";

export type JsonSchemaWidgetProps = {
  schema: RenderableSchema;
  value: JsonValue | undefined;
  onChange: (value: JsonValue | undefined) => void;
  id: string;
  label: string;
  path: string;
  describedBy?: string;
  invalid: boolean;
};

// These components represent a complete schema field; array widgets bypass row editors.
export const specializedWidgets = new Set([
  "input-number",
  "color-picker",
  "date-picker",
  "dm-date-picker",
  "mentions",
  "otp-input",
  "rate",
  "segmented",
  "select",
  "slider",
  "time-picker",
  "transfer",
  "tree-select",
  "cascader",
  "upload",
]);

export function JsonSchemaWidget({
  schema,
  value,
  onChange,
  id,
  label,
  path,
  describedBy,
  invalid,
}: JsonSchemaWidgetProps) {
  const widget = schema["x-widget"]!;
  const config = widgetConfig(schema);
  const options = optionsFor(schema);
  const common = {
    id,
    "aria-label": label,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
    "data-field-path": path,
  };
  const resetKey = value === undefined ? "empty" : "filled";
  const natural = naturalWidgetValue(schema);
  if (value === undefined && natural !== undefined) {
    return (
      <Button
        {...common}
        type="button"
        appearance="outline"
        onClick={() => onChange(natural)}
      >
        Set {label}
      </Button>
    );
  }
  const scalar = schema.type !== "array";
  const choices = schema.enum ?? schema.items?.enum ?? [];
  const entries = Array.isArray(value)
    ? value
    : value === undefined
      ? []
      : [value];
  const invalidChoices = entries.filter(
    (entry, index) =>
      !choices.some((option) => Object.is(option, entry)) &&
      entries.findIndex((option) => Object.is(option, entry)) === index,
  );
  const reversibleChoices = [...choices, ...invalidChoices];
  const indexed = options.map((option) => ({
    label: option.label,
    value: String(choices.findIndex((value) => Object.is(value, option.value))),
    disabled: option.disabled,
  }));
  const selected = choices.findIndex((option) => Object.is(option, value));
  let control: React.ReactNode;
  switch (widget) {
    case "input-number":
      control = (
        <InputNumber
          {...common}
          value={typeof value === "number" ? value : null}
          status={invalid ? "error" : undefined}
          onChange={(next) => onChange(next ?? undefined)}
        />
      );
      break;
    case "mentions":
      control = (
        <Mentions
          {...common}
          value={typeof value === "string" ? value : ""}
          options={options.map((option) => ({
            ...option,
            value: String(option.value),
          }))}
          onChange={onChange}
        />
      );
      break;
    case "otp-input":
      control = (
        <OtpInput
          {...common}
          length={(config.length ?? 6) as OtpInputLength}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      );
      break;
    case "date-picker":
    case "dm-date-picker": {
      const Picker = widget === "date-picker" ? DatePicker : DmDatePicker;
      control = (
        <Picker
          value={typeof value === "string" ? value : ""}
          inputProps={common}
          allowClear
          status={invalid ? "error" : undefined}
          onChange={(next) => onChange(next)}
        />
      );
      break;
    }
    case "time-picker":
      control = (
        <TimePicker
          value={typeof value === "string" ? value : ""}
          inputProps={common}
          format="HH:mm:ss"
          allowClear
          status={invalid ? "error" : undefined}
          onChange={(next, clock) =>
            onChange(clock || (typeof next === "string" ? next : undefined))
          }
        />
      );
      break;
    case "color-picker":
      control = (
        <ColorPicker
          value={typeof value === "string" ? value : "#000000"}
          triggerProps={common}
          format="hex"
          showText
          onChange={(next) =>
            onChange(typeof next === "string" ? next : "#000000")
          }
        />
      );
      break;
    case "rate":
      control = (
        <Rate
          {...common}
          value={typeof value === "number" ? value : 0}
          count={config.count ?? 5}
          allowHalf={config.allowHalf ?? false}
          onChange={onChange}
        />
      );
      break;
    case "slider":
      control = (
        <Slider
          {...common}
          value={typeof value === "number" ? value : config.min}
          min={config.min}
          max={config.max}
          step={config.step}
          onChange={(next) => onChange(next as JsonValue)}
        />
      );
      break;
    case "segmented":
      control = (
        <Segmented
          {...common}
          options={indexed}
          value={selected >= 0 ? String(selected) : "invalid"}
          onChange={(next) => onChange(choices[Number(next)])}
        />
      );
      break;
    case "select": {
      const selectOptions = [
        ...indexed,
        ...invalidChoices.map((entry, index) => ({
          value: String(choices.length + index),
          label: `${String(entry)} (not an option)`,
          disabled: false,
        })),
      ];
      const selection = scalar
        ? value !== undefined
          ? String(
              reversibleChoices.findIndex((entry) => Object.is(entry, value)),
            )
          : undefined
        : (Array.isArray(value) ? value : []).map((entry) =>
            String(
              reversibleChoices.findIndex((option) => Object.is(option, entry)),
            ),
          );
      control = (
        <Select
          key={resetKey}
          options={selectOptions}
          value={selection}
          mode={scalar ? undefined : "multiple"}
          allowClear
          showSearch
          placeholder={`Choose ${label}`}
          status={invalid ? "error" : undefined}
          onChange={(next) =>
            onChange(
              Array.isArray(next)
                ? next.map((key) => reversibleChoices[Number(key)])
                : next === undefined
                  ? undefined
                  : reversibleChoices[Number(next)],
            )
          }
        />
      );
      break;
    }
    case "cascader":
      control = (
        <Cascader
          options={options as Parameters<typeof Cascader>[0]["options"]}
          value={(Array.isArray(value) ? value : []) as (string | number)[]}
          allowClear
          showSearch
          placeholder={`Choose ${label}`}
          status={invalid ? "error" : undefined}
          onChange={(next) => onChange(next)}
        />
      );
      break;
    case "tree-select":
      control = (
        <TreeSelect
          key={resetKey}
          treeData={options.map(function node(option): TreeSelectDataNode {
            return {
              value: option.value as string | number,
              title: option.label,
              disabled: option.disabled,
              children: option.children?.map(node),
            };
          })}
          value={
            (scalar
              ? typeof value === "string" || typeof value === "number"
                ? value
                : undefined
              : Array.isArray(value)
                ? value
                : []) as string | number | (string | number)[] | undefined
          }
          multiple={!scalar}
          allowClear
          showSearch
          placeholder={`Choose ${label}`}
          onChange={(next, _label, extra) => {
            if (scalar || extra.triggerValue === undefined) onChange(next);
            else
              onChange(
                extra.selected
                  ? [...entries, extra.triggerValue]
                  : entries.filter(
                      (entry) => !Object.is(entry, extra.triggerValue),
                    ),
              );
          }}
        />
      );
      break;
    case "transfer":
      control = (
        <Transfer
          dataSource={[
            ...options,
            ...invalidChoices.map((entry) => ({
              value: entry as string,
              label: `${String(entry)} (not an option)`,
              disabled: false,
            })),
          ].map((option) => ({
            key: String(option.value),
            title: option.label,
            disabled: option.disabled,
          }))}
          targetKeys={(Array.isArray(value) ? value : []) as string[]}
          showSearch
          onChange={(_next, direction, moved) =>
            onChange(
              direction === "right"
                ? [...entries, ...moved.filter((key) => !entries.includes(key))]
                : entries.filter((entry) => !moved.includes(entry as string)),
            )
          }
        />
      );
      break;
    case "upload": {
      const metadata = (Array.isArray(value) ? value : []) as {
        name: string;
        size: number;
        type: string;
        lastModified: number;
      }[];
      const files: UploadFile[] = metadata.map((file, index) => ({
        ...file,
        uid: String(index),
      }));
      control = (
        <Upload
          inputProps={{ "aria-label": `${label} files` }}
          multiple
          fileList={files}
          beforeUpload={() => false}
          onChange={({ fileList }) => {
            const next = fileList.map((file) => {
              const existing = metadata[Number(file.uid)];
              return {
                name: file.name,
                size: file.size ?? 0,
                type: file.type ?? "",
                lastModified:
                  file.originFileObj?.lastModified ??
                  existing?.lastModified ??
                  0,
              };
            });
            onChange(next);
          }}
        >
          <Button type="button" appearance="outline" {...common}>
            Choose {label}
          </Button>
        </Upload>
      );
      break;
    }
    default:
      control = (
        <Input
          {...common}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      );
  }
  const showRaw =
    value !== undefined &&
    [
      "date-picker",
      "dm-date-picker",
      "time-picker",
      "rate",
      "slider",
      "color-picker",
      "otp-input",
      "select",
      "segmented",
      "cascader",
      "tree-select",
      "transfer",
    ].includes(widget);
  return (
    <div
      className="schema-widget"
      aria-describedby={describedBy}
      aria-invalid={invalid}
      data-field-path={path}
    >
      {control}
      {showRaw ? (
        <p className="schema-widget-value">
          Current value: <output>{JSON.stringify(value)}</output>
        </p>
      ) : null}
    </div>
  );
}
