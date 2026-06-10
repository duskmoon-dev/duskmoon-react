import React, { forwardRef } from "react";
import { getDmDatePickerClasses } from "../../classes/dm-date-picker";
import { getDmDatePickerLocale, setDmDatePickerLocale } from "../../infrastructure";
import { DatePicker } from "../date-picker";
import type {
  DmDatePickerComponent,
  DmDatePickerProps,
  DmRangePickerProps,
} from "./DmDatePicker.types";

function getDefaultPlaceholder(picker: DmDatePickerProps["picker"]) {
  const locale = getDmDatePickerLocale();

  if (locale === "zh") {
    if (picker === "month") return "请选择月份";
    if (picker === "year") return "请选择年份";
    if (picker === "week") return "请选择周";
    if (picker === "time") return "请选择时间";
    return "请选择日期";
  }

  return undefined;
}

const DmDatePickerRoot = forwardRef<HTMLDivElement, DmDatePickerProps>(
  ({ className, placeholder, picker, ...props }, ref) => (
    <DatePicker
      {...props}
      ref={ref}
      picker={picker}
      placeholder={placeholder ?? getDefaultPlaceholder(picker)}
      className={getDmDatePickerClasses({ className })}
    />
  ),
);

DmDatePickerRoot.displayName = "DmDatePicker";

const DmRangePicker = forwardRef<HTMLDivElement, DmRangePickerProps>(
  ({ className, ...props }, ref) => (
    <DatePicker.RangePicker
      {...props}
      ref={ref}
      className={getDmDatePickerClasses({ className })}
    />
  ),
);

DmRangePicker.displayName = "DmDatePicker.RangePicker";

export const DmDatePicker = DmDatePickerRoot as DmDatePickerComponent;
DmDatePicker.RangePicker = DmRangePicker;
DmDatePicker.WeekPicker = forwardRef<HTMLDivElement, DmDatePickerProps>(
  (props, ref) => <DmDatePicker {...props} ref={ref} picker="week" />,
);
DmDatePicker.MonthPicker = forwardRef<HTMLDivElement, DmDatePickerProps>(
  (props, ref) => <DmDatePicker {...props} ref={ref} picker="month" />,
);
DmDatePicker.QuarterPicker = forwardRef<HTMLDivElement, DmDatePickerProps>(
  (props, ref) => <DmDatePicker {...props} ref={ref} picker="quarter" />,
);
DmDatePicker.YearPicker = forwardRef<HTMLDivElement, DmDatePickerProps>(
  (props, ref) => <DmDatePicker {...props} ref={ref} picker="year" />,
);

export { setDmDatePickerLocale };
