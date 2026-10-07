import React, { forwardRef, useMemo, useState } from "react";
import { Calendar } from "../calendar";
import type { CalendarMode } from "../calendar";
import { usePickerDropdown } from "./usePickerDropdown";
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
      inputProps,
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
    const [calendarMode, setCalendarMode] = useState<CalendarMode>("month");
    const isValueControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState(() =>
      normalizeDateValue(defaultValue),
    );
    const dropdown = usePickerDropdown({
      open,
      defaultOpen,
      disabled,
      onOpenChange,
      ref,
    });
    const currentValue = isValueControlled
      ? normalizeDateValue(value)
      : innerValue;
    const { visible, setVisible } = dropdown;
    const inputType = inputTypeForPicker(picker);

    function emitChange(nextValue: string | undefined) {
      if (nextValue && disabledDate?.(nextValue)) {
        return;
      }

      if (!isValueControlled) {
        setInnerValue(nextValue);
      }

      onChange?.(nextValue, nextValue ?? "");
    }

    function selectValue(nextValue: string) {
      if (disabledDate?.(nextValue)) return;
      emitChange(nextValue);
      dropdown.closeAndFocus();
    }

    const presetItems = useMemo(() => presets ?? [], [presets]);

    return (
      <div
        {...props}
        ref={dropdown.rootRef}
        onBlur={dropdown.onRootBlur}
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
          {...inputProps}
          ref={dropdown.inputRef}
          aria-haspopup="dialog"
          aria-controls={visible ? dropdown.panelId : undefined}
          className={datePickerInputClass}
          disabled={disabled}
          type={inputType}
          value={currentValue ?? ""}
          placeholder={placeholder ?? placeholderForPicker(picker)}
          onFocus={(event) => {
            onFocus?.(event);
            dropdown.onInputFocus();
          }}
          onBlur={(event) => {
            onBlur?.(event);
          }}
          onClick={() => setVisible(true)}
          onChange={(event) =>
            emitChange(event.currentTarget.value || undefined)
          }
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
        <button
          type="button"
          className={datePickerIconClass}
          aria-label="Open date picker"
          aria-haspopup="dialog"
          aria-expanded={visible}
          aria-controls={visible ? dropdown.panelId : undefined}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible(!visible)}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
        </button>
        {visible ? (
          <div
            id={dropdown.panelId}
            role="dialog"
            aria-label="Choose date"
            className={getDatePickerDropdownClasses({ open: visible })}
          >
            {picker === "date" || picker === "month" ? (
              <Calendar
                fullscreen={false}
                value={currentValue}
                mode={picker === "month" ? "year" : calendarMode}
                onPanelChange={(_, mode) => {
                  if (picker === "date") setCalendarMode(mode);
                }}
                disabledDate={(date) => {
                  if (!disabledDate) return false;
                  if (picker === "month") return disabledDate(date.slice(0, 7));
                  if (calendarMode === "year") {
                    const [year, month] = date.split("-").map(Number);
                    const days = new Date(year, month, 0).getDate();
                    return Array.from(
                      { length: days },
                      (_, index) =>
                        `${date.slice(0, 7)}-${String(index + 1).padStart(2, "0")}`,
                    ).every((day) => disabledDate(day));
                  }
                  return disabledDate(date);
                }}
                onSelect={(date, info) => {
                  if (picker === "date" && info.source === "month") {
                    setCalendarMode("month");
                    return;
                  }
                  selectValue(picker === "month" ? date.slice(0, 7) : date);
                }}
              />
            ) : (
              <input
                type={inputType}
                aria-label={placeholderForPicker(picker)}
                value={currentValue ?? ""}
                onChange={(event) => selectValue(event.currentTarget.value)}
              />
            )}
            {presetItems.map((preset, index) => (
              <button
                key={index}
                type="button"
                className={datePickerPresetClass}
                onMouseDown={(event) => event.preventDefault()}
                disabled={Boolean(disabledDate?.(preset.value))}
                onClick={() => selectValue(preset.value)}
              >
                {preset.label}
              </button>
            ))}
            {showNow ? (
              <div className={datePickerFooterClass}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  disabled={Boolean(disabledDate?.(todayValue(picker)))}
                  onClick={() => selectValue(todayValue(picker))}
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
      inputProps,
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
        index === 0
          ? [nextItem, currentValue?.[1]]
          : [currentValue?.[0], nextItem],
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
          {...inputProps}
          className={datePickerInputClass}
          disabled={disabled}
          type={inputType}
          value={currentValue?.[0] ?? ""}
          placeholder={
            Array.isArray(placeholder) ? placeholder[0] : "Start date"
          }
          onChange={(event) =>
            updateIndex(0, event.currentTarget.value || undefined)
          }
        />
        <span className={datePickerSeparatorClass}>{separator}</span>
        <input
          {...inputProps}
          id={inputProps?.id ? `${inputProps.id}-end` : undefined}
          className={datePickerInputClass}
          disabled={disabled}
          type={inputType}
          value={currentValue?.[1] ?? ""}
          placeholder={Array.isArray(placeholder) ? placeholder[1] : "End date"}
          onChange={(event) =>
            updateIndex(1, event.currentTarget.value || undefined)
          }
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
