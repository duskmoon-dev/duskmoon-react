import React, { forwardRef, useState } from "react";
import {
  getTimePickerClasses,
  getTimePickerPanelClasses,
  timePickerClearClass,
  timePickerFooterClass,
  timePickerIconClass,
  timePickerInputClass,
  timePickerNowClass,
  timePickerSeparatorClass,
} from "../../classes/time-picker";
import type {
  RangePickerProps,
  TimePickerComponent,
  TimePickerProps,
  TimePickerRangeValue,
  TimePickerValue,
} from "./TimePicker.types";

const TIME_PARTS_PATTERN = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/;

function padTimePart(value: number) {
  return String(value).padStart(2, "0");
}

function readDateTime(value: Date) {
  return {
    hour: value.getHours(),
    minute: value.getMinutes(),
    second: value.getSeconds(),
  };
}

function parseTimeParts(value: string) {
  const match = value.trim().match(TIME_PARTS_PATTERN);

  if (!match) {
    return undefined;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] === undefined ? 0 : Number(match[3]);
  const meridiem = match[4]?.toLowerCase();

  if (meridiem) {
    if (hour < 1 || hour > 12) return undefined;
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
  }

  if (hour > 23 || minute > 59 || second > 59) {
    return undefined;
  }

  return { hour, minute, second };
}

function valueToParts(value: TimePickerValue | undefined) {
  if (value === undefined) return undefined;
  if (value instanceof Date) return readDateTime(value);
  return parseTimeParts(value);
}

function formatParts(
  parts: { hour: number; minute: number; second: number },
  format: string,
  use12Hours?: boolean,
) {
  const twelveHour = parts.hour % 12 || 12;
  const meridiem = parts.hour >= 12 ? "PM" : "AM";

  return format
    .replace(/HH/g, padTimePart(parts.hour))
    .replace(/H/g, String(parts.hour))
    .replace(/hh/g, padTimePart(twelveHour))
    .replace(/h/g, String(twelveHour))
    .replace(/mm/g, padTimePart(parts.minute))
    .replace(/m/g, String(parts.minute))
    .replace(/ss/g, padTimePart(parts.second))
    .replace(/s/g, String(parts.second))
    .replace(/A/g, meridiem)
    .replace(/a/g, use12Hours ? meridiem.toLowerCase() : "");
}

function displayValue(
  value: TimePickerValue | undefined,
  format: string,
  use12Hours?: boolean,
) {
  const parts = valueToParts(value);
  return parts ? formatParts(parts, format, use12Hours) : "";
}

function normalizedTimeString(
  value: TimePickerValue | undefined,
  format: string,
  use12Hours?: boolean,
) {
  return displayValue(value, format, use12Hours);
}

function isDisabledTime(
  value: TimePickerValue | undefined,
  props: Pick<TimePickerProps, "disabledTime" | "use12Hours">,
) {
  if (!value || !props.disabledTime) {
    return false;
  }

  const parts = valueToParts(value);
  if (!parts) {
    return false;
  }

  const config = props.disabledTime(value);
  return (
    config.disabledHours?.().includes(parts.hour) ||
    config.disabledMinutes?.(parts.hour).includes(parts.minute) ||
    config.disabledSeconds?.(parts.hour, parts.minute).includes(parts.second) ||
    false
  );
}

function nowValue() {
  const now = new Date();
  return `${padTimePart(now.getHours())}:${padTimePart(now.getMinutes())}:${padTimePart(
    now.getSeconds(),
  )}`;
}

const TimePickerRoot = forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      allowClear,
      className,
      defaultOpen,
      defaultValue,
      disabled,
      disabledTime,
      format,
      onBlur,
      onChange,
      onFocus,
      onOpenChange,
      open,
      placeholder = "Select time",
      showNow = true,
      size = "md",
      status,
      use12Hours,
      value,
      ...props
    },
    ref,
  ) => {
    const timeFormat = format ?? (use12Hours ? "h:mm:ss A" : "HH:mm:ss");
    const isValueControlled = value !== undefined;
    const isOpenControlled = open !== undefined;
    const [innerValue, setInnerValue] = useState<TimePickerValue | undefined>(
      defaultValue,
    );
    const [innerOpen, setInnerOpen] = useState(Boolean(defaultOpen));
    const currentValue = isValueControlled ? value : innerValue;
    const visible = isOpenControlled ? Boolean(open) : innerOpen;

    function setVisible(nextOpen: boolean) {
      if (!isOpenControlled) {
        setInnerOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    }

    function emitChange(nextValue: TimePickerValue | undefined) {
      if (isDisabledTime(nextValue, { disabledTime, use12Hours })) {
        return;
      }

      if (!isValueControlled) {
        setInnerValue(nextValue);
      }

      onChange?.(nextValue, normalizedTimeString(nextValue, timeFormat, use12Hours));
    }

    return (
      <div
        {...props}
        ref={ref}
        className={getTimePickerClasses({
          size,
          status,
          disabled,
          open: visible,
          className,
        })}
      >
        <input
          className={timePickerInputClass}
          disabled={disabled}
          value={displayValue(currentValue, timeFormat, use12Hours)}
          placeholder={placeholder}
          onFocus={(event) => {
            onFocus?.(event);
            setVisible(true);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            setVisible(false);
          }}
          onChange={(event) =>
            emitChange(event.currentTarget.value || undefined)
          }
        />
        {allowClear && currentValue && !disabled ? (
          <button
            type="button"
            className={timePickerClearClass}
            aria-label="Clear time"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => emitChange(undefined)}
          >
            x
          </button>
        ) : null}
        <span className={timePickerIconClass} aria-hidden="true">
          clock
        </span>
        {showNow && visible ? (
          <div className={getTimePickerPanelClasses({ open: visible })}>
            <div className={timePickerFooterClass}>
              <button
                type="button"
                className={timePickerNowClass}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => emitChange(nowValue())}
              >
                Now
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

TimePickerRoot.displayName = "TimePicker";

const RangePicker = forwardRef<HTMLDivElement, RangePickerProps>(
  (
    {
      allowClear,
      className,
      defaultValue,
      disabled,
      disabledTime,
      format,
      onChange,
      placeholder,
      separator = "-",
      showNow,
      size = "md",
      status,
      use12Hours,
      value,
      ...props
    },
    ref,
  ) => {
    const timeFormat = format ?? (use12Hours ? "h:mm:ss A" : "HH:mm:ss");
    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState<TimePickerRangeValue>(
      defaultValue ?? [undefined, undefined],
    );
    const currentValue = isControlled ? value : innerValue;

    function emitChange(nextValue: TimePickerRangeValue) {
      if (
        nextValue.some((item) =>
          isDisabledTime(item, { disabledTime, use12Hours }),
        )
      ) {
        return;
      }

      if (!isControlled) {
        setInnerValue(nextValue);
      }

      onChange?.(nextValue, [
        normalizedTimeString(nextValue[0], timeFormat, use12Hours),
        normalizedTimeString(nextValue[1], timeFormat, use12Hours),
      ]);
    }

    function updateIndex(index: 0 | 1, nextItem: TimePickerValue | undefined) {
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
        className={getTimePickerClasses({
          size,
          status,
          disabled,
          range: true,
          className,
        })}
      >
        <input
          className={timePickerInputClass}
          disabled={disabled}
          value={displayValue(currentValue?.[0], timeFormat, use12Hours)}
          placeholder={placeholder?.[0] ?? "Start time"}
          onChange={(event) =>
            updateIndex(0, event.currentTarget.value || undefined)
          }
        />
        <span className={timePickerSeparatorClass}>{separator}</span>
        <input
          className={timePickerInputClass}
          disabled={disabled}
          value={displayValue(currentValue?.[1], timeFormat, use12Hours)}
          placeholder={placeholder?.[1] ?? "End time"}
          onChange={(event) =>
            updateIndex(1, event.currentTarget.value || undefined)
          }
        />
        {showNow ? (
          <button
            type="button"
            className={timePickerNowClass}
            disabled={disabled}
            onClick={() => emitChange([nowValue(), nowValue()])}
          >
            Now
          </button>
        ) : null}
        {allowClear && (currentValue?.[0] || currentValue?.[1]) && !disabled ? (
          <button
            type="button"
            className={timePickerClearClass}
            aria-label="Clear time range"
            onClick={() => emitChange([undefined, undefined])}
          >
            x
          </button>
        ) : null}
      </div>
    );
  },
);

RangePicker.displayName = "TimePicker.RangePicker";

export const TimePicker = Object.assign(TimePickerRoot, {
  RangePicker,
}) as TimePickerComponent;
