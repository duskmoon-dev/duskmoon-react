import React, { forwardRef, useMemo, useState } from "react";
import {
  datePickerClearClass,
  datePickerFooterClass,
  datePickerIconClass,
  datePickerInputClass,
  datePickerPresetClass,
  datePickerSeparatorClass,
  getDatePickerClasses,
  getDatePickerDropdownClasses,
} from "../../classes/date-picker";
import type {
  DatePickerComponent,
  DatePickerPicker,
  DatePickerProps,
  DatePickerRangeValue,
  RangePickerProps,
} from "./DatePicker.types";

function todayValue(picker: DatePickerPicker) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  if (picker === "month") return `${year}-${month}`;
  if (picker === "year") return String(year);
  if (picker === "time") return "00:00";

  return `${year}-${month}-${day}`;
}

function inputTypeForPicker(picker: DatePickerPicker) {
  if (picker === "month") return "month";
  if (picker === "week") return "week";
  if (picker === "time") return "time";

  return picker === "year" || picker === "quarter" ? "text" : "date";
}

function placeholderForPicker(picker: DatePickerPicker) {
  if (picker === "month") return "Select month";
  if (picker === "week") return "Select week";
  if (picker === "quarter") return "Select quarter";
  if (picker === "year") return "Select year";
  if (picker === "time") return "Select time";

  return "Select date";
}

function normalizeDateValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

const DatePickerRoot = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      allowClear,
      className,
      defaultOpen,
      defaultValue,
      disabled,
      disabledDate,
      onBlur,
      onChange,
      onFocus,
      onOpenChange,
      open,
      picker = "date",
      placeholder,
      presets,
      showNow,
      size = "md",
      status,
      value,
      ...props
    },
    ref,
  ) => {
    const isValueControlled = value !== undefined;
    const isOpenControlled = open !== undefined;
    const [innerValue, setInnerValue] = useState(() =>
      normalizeDateValue(defaultValue),
    );
    const [innerOpen, setInnerOpen] = useState(Boolean(defaultOpen));
    const currentValue = isValueControlled ? normalizeDateValue(value) : innerValue;
    const visible = isOpenControlled ? Boolean(open) : innerOpen;
    const inputType = inputTypeForPicker(picker);

    function setVisible(nextOpen: boolean) {
      if (!isOpenControlled) {
        setInnerOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    }

    function emitChange(nextValue: string | undefined) {
      if (nextValue && disabledDate?.(nextValue)) {
        return;
      }

      if (!isValueControlled) {
        setInnerValue(nextValue);
      }

      onChange?.(nextValue, nextValue ?? "");
    }

    const presetItems = useMemo(() => presets ?? [], [presets]);

    return (
      <div
        {...props}
        ref={ref}
        className={getDatePickerClasses({
          size,
          status,
          picker,
          open: visible,
          disabled,
          className,
        })}
      >
        <input
          className={datePickerInputClass}
          disabled={disabled}
          type={inputType}
          value={currentValue ?? ""}
          placeholder={placeholder ?? placeholderForPicker(picker)}
          onFocus={(event) => {
            onFocus?.(event);
            setVisible(true);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            setVisible(false);
          }}
          onChange={(event) => emitChange(event.currentTarget.value || undefined)}
        />
        {allowClear && currentValue && !disabled ? (
          <button
            type="button"
            className={datePickerClearClass}
            aria-label="Clear date"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => emitChange(undefined)}
          >
            x
          </button>
        ) : null}
        <span className={datePickerIconClass} aria-hidden="true" />
        {(presetItems.length > 0 || showNow) && visible ? (
          <div className={getDatePickerDropdownClasses({ open: visible })}>
            {presetItems.map((preset, index) => (
              <button
                key={index}
                type="button"
                className={datePickerPresetClass}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => emitChange(preset.value)}
              >
                {preset.label}
              </button>
            ))}
            {showNow ? (
              <div className={datePickerFooterClass}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => emitChange(todayValue(picker))}
                >
                  Now
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

DatePickerRoot.displayName = "DatePicker";

const RangePicker = forwardRef<HTMLDivElement, RangePickerProps>(
  (
    {
      allowClear,
      className,
      defaultValue,
      disabled,
      disabledDate,
      onChange,
      picker = "date",
      placeholder,
      separator = "-",
      size = "md",
      status,
      value,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState<DatePickerRangeValue>(
      defaultValue ?? [undefined, undefined],
    );
    const currentValue = isControlled ? value : innerValue;
    const inputType = inputTypeForPicker(picker);

    function emitChange(nextValue: DatePickerRangeValue) {
      if (
        nextValue.some(
          (item) => item !== undefined && Boolean(disabledDate?.(item)),
        )
      ) {
        return;
      }

      if (!isControlled) {
        setInnerValue(nextValue);
      }

      onChange?.(nextValue, [nextValue[0] ?? "", nextValue[1] ?? ""]);
    }

    function updateIndex(index: 0 | 1, nextItem: string | undefined) {
      emitChange(
        index === 0 ? [nextItem, currentValue?.[1]] : [currentValue?.[0], nextItem],
      );
    }

    return (
      <div
        {...props}
        ref={ref}
        className={getDatePickerClasses({
          size,
          status,
          picker,
          disabled,
          range: true,
          className,
        })}
      >
        <input
          className={datePickerInputClass}
          disabled={disabled}
          type={inputType}
          value={currentValue?.[0] ?? ""}
          placeholder={Array.isArray(placeholder) ? placeholder[0] : "Start date"}
          onChange={(event) => updateIndex(0, event.currentTarget.value || undefined)}
        />
        <span className={datePickerSeparatorClass}>{separator}</span>
        <input
          className={datePickerInputClass}
          disabled={disabled}
          type={inputType}
          value={currentValue?.[1] ?? ""}
          placeholder={Array.isArray(placeholder) ? placeholder[1] : "End date"}
          onChange={(event) => updateIndex(1, event.currentTarget.value || undefined)}
        />
        {allowClear && (currentValue?.[0] || currentValue?.[1]) && !disabled ? (
          <button
            type="button"
            className={datePickerClearClass}
            aria-label="Clear date range"
            onClick={() => emitChange([undefined, undefined])}
          >
            x
          </button>
        ) : null}
      </div>
    );
  },
);

RangePicker.displayName = "DatePicker.RangePicker";

function withPicker(picker: DatePickerPicker, displayName: string) {
  const Picker = forwardRef<HTMLDivElement, DatePickerProps>((props, ref) => (
    <DatePickerRoot {...props} ref={ref} picker={picker} />
  ));
  Picker.displayName = displayName;
  return Picker;
}

export const DatePicker = Object.assign(DatePickerRoot, {
  RangePicker,
  WeekPicker: withPicker("week", "DatePicker.WeekPicker"),
  MonthPicker: withPicker("month", "DatePicker.MonthPicker"),
  QuarterPicker: withPicker("quarter", "DatePicker.QuarterPicker"),
  YearPicker: withPicker("year", "DatePicker.YearPicker"),
}) as DatePickerComponent;
