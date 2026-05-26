import React, { forwardRef, useState } from "react";
import {
  getSegmentedClasses,
  getSegmentedItemClasses,
  segmentedIconClass,
} from "../../classes/segmented";
import type {
  SegmentedOption,
  SegmentedOptionObject,
  SegmentedProps,
  SegmentedValue,
} from "./Segmented.types";

function normalizeOption(option: SegmentedOption): SegmentedOptionObject {
  if (typeof option === "object" && option !== null && "value" in option) {
    return option;
  }

  return {
    label: option,
    value: option,
  };
}

export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      disabled,
      block,
      size = "md",
      className,
      ...props
    },
    ref,
  ) => {
    const normalizedOptions = options.map(normalizeOption);
    const initialValue =
      defaultValue ??
      normalizedOptions.find((option) => !option.disabled)?.value;
    const [internalValue, setInternalValue] = useState<
      SegmentedValue | undefined
    >(initialValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    function selectOption(option: SegmentedOptionObject) {
      if (disabled || option.disabled || option.value === currentValue) {
        return;
      }

      if (!isControlled) {
        setInternalValue(option.value);
      }

      onChange?.(option.value);
    }

    return (
      <div
        {...props}
        ref={ref}
        role="radiogroup"
        aria-disabled={disabled || undefined}
        className={getSegmentedClasses({ block, className })}
      >
        {normalizedOptions.map((option) => {
          const active = option.value === currentValue;
          const itemDisabled = disabled || option.disabled;

          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={itemDisabled}
              className={getSegmentedItemClasses({
                size,
                active,
                disabled: itemDisabled,
                className: option.className,
              })}
              onClick={() => selectOption(option)}
            >
              {option.icon ? (
                <span className={segmentedIconClass}>{option.icon}</span>
              ) : null}
              {option.label}
            </button>
          );
        })}
      </div>
    );
  },
);

Segmented.displayName = "Segmented";
