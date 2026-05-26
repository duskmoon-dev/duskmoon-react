import { cn } from "../utils";
import type {
  DatePickerPicker,
  DatePickerSize,
  DatePickerStatus,
} from "../components/date-picker/DatePicker.types";

export const datePickerBaseClass = "datepicker";
export const datePickerInputClass = "datepicker-input";
export const datePickerIconClass = "datepicker-icon";
export const datePickerDropdownClass = "datepicker-dropdown";
export const datePickerDropdownOpenClass = "datepicker-dropdown-open";
export const datePickerFooterClass = "datepicker-footer";
export const datePickerPresetClass = "datepicker-preset";
export const datePickerRangeClass = "datepicker-range";
export const datePickerSeparatorClass = "datepicker-range-separator";
export const datePickerClearClass = "datepicker-clear";

export const datePickerSizeClasses: Record<DatePickerSize, string> = {
  sm: "datepicker-sm",
  md: "",
  lg: "datepicker-lg",
};

export const datePickerStatusClasses: Record<DatePickerStatus, string> = {
  error: "datepicker-error",
  success: "datepicker-success",
};

export const datePickerPickerClasses: Record<DatePickerPicker, string> = {
  date: "",
  week: "datepicker-week",
  month: "datepicker-month-picker",
  quarter: "datepicker-quarter-picker",
  year: "datepicker-year-picker",
  time: "datepicker-time-picker",
};

export function getDatePickerClasses({
  size = "md",
  status,
  picker = "date",
  open,
  disabled,
  range,
  className,
}: {
  size?: DatePickerSize;
  status?: DatePickerStatus;
  picker?: DatePickerPicker;
  open?: boolean;
  disabled?: boolean;
  range?: boolean;
  className?: string;
}) {
  return cn(
    datePickerBaseClass,
    datePickerSizeClasses[size],
    status && datePickerStatusClasses[status],
    datePickerPickerClasses[picker],
    open && "datepicker-open",
    disabled && "datepicker-disabled",
    range && datePickerRangeClass,
    className,
  );
}

export function getDatePickerDropdownClasses({
  open,
  className,
}: {
  open?: boolean;
  className?: string;
}) {
  return cn(
    datePickerDropdownClass,
    open && datePickerDropdownOpenClass,
    className,
  );
}
