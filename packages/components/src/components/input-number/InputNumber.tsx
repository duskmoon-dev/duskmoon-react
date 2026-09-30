import React, { forwardRef, useMemo, useState } from "react";
import {
  getInputNumberClasses,
  inputNumberControlClass,
  inputNumberControlsClass,
  inputNumberInputClass,
} from "../../classes/input-number";
import type { InputNumberProps, InputNumberValue } from "./InputNumber.types";

function clamp(value: number, min?: number, max?: number) {
  const withMin = min === undefined ? value : Math.max(min, value);
  return max === undefined ? withMin : Math.min(max, withMin);
}

function normalizePrecision(value: number, precision?: number) {
  if (precision === undefined) return value;
  return Number(value.toFixed(precision));
}

function parseNumber(value: string): InputNumberValue {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDisplayValue(
  value: InputNumberValue,
  formatter?: InputNumberProps["formatter"],
) {
  if (formatter) return formatter(value);
  return value === null || value === undefined ? "" : String(value);
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      className,
      controls = true,
      defaultValue = null,
      disabled,
      formatter,
      keyboard = true,
      max,
      min,
      onChange,
      onKeyDown,
      onStep,
      parser = parseNumber,
      precision,
      size = "md",
      status,
      step = 1,
      value,
      ...props
    },
    ref,
  ) => {
    const controlled = value !== undefined;
    const [innerValue, setInnerValue] =
      useState<InputNumberValue>(defaultValue);
    const currentValue = controlled ? value : innerValue;
    const displayValue = useMemo(
      () => toDisplayValue(currentValue, formatter),
      [currentValue, formatter],
    );

    function emitChange(nextValue: InputNumberValue) {
      const normalized =
        typeof nextValue === "number"
          ? normalizePrecision(clamp(nextValue, min, max), precision)
          : nextValue;

      if (!controlled) {
        setInnerValue(normalized);
      }

      onChange?.(normalized);
      return normalized;
    }

    function stepValue(type: "up" | "down") {
      if (disabled) return;
      const offset = type === "up" ? step : -step;
      const base = typeof currentValue === "number" ? currentValue : 0;
      const nextValue = emitChange(base + offset);
      onStep?.(nextValue, { offset, type });
    }

    return (
      <span
        className={getInputNumberClasses({
          size,
          status,
          disabled,
          className,
        })}
      >
        <input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          className={inputNumberInputClass}
          disabled={disabled}
          value={displayValue}
          onChange={(event) => emitChange(parser(event.currentTarget.value))}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (!keyboard || event.defaultPrevented) return;
            if (event.key === "ArrowUp") {
              event.preventDefault();
              stepValue("up");
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              stepValue("down");
            }
          }}
        />
        {controls ? (
          <span className={inputNumberControlsClass}>
            <button
              type="button"
              className={inputNumberControlClass}
              disabled={
                disabled || (max !== undefined && Number(currentValue) >= max)
              }
              aria-label="Increase value"
              onClick={() => stepValue("up")}
            >
              +
            </button>
            <button
              type="button"
              className={inputNumberControlClass}
              disabled={
                disabled || (min !== undefined && Number(currentValue) <= min)
              }
              aria-label="Decrease value"
              onClick={() => stepValue("down")}
            >
              -
            </button>
          </span>
        ) : null}
      </span>
    );
  },
);

InputNumber.displayName = "InputNumber";
