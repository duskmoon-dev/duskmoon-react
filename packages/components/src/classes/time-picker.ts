import { cn } from "../utils";
import type {
  TimePickerSize,
  TimePickerStatus,
} from "../components/time-picker/TimePicker.types";

export const timePickerBaseClass = "time-input time-picker";
export const timePickerInputClass = "time-picker-input";
export const timePickerIconClass = "time-picker-icon";
export const timePickerClearClass = "time-picker-clear";
export const timePickerPanelClass = "time-input-picker time-picker-panel";
export const timePickerFooterClass = "time-picker-footer";
export const timePickerNowClass = "time-picker-now";
export const timePickerRangeClass = "time-picker-range";
export const timePickerSeparatorClass = "time-picker-range-separator";

export const timePickerSizeClasses: Record<TimePickerSize, string> = {
  sm: "time-picker-sm",
  md: "",
  lg: "time-picker-lg",
};

export const timePickerStatusClasses: Record<TimePickerStatus, string> = {
  error: "time-picker-error",
  success: "time-picker-success",
};

export function getTimePickerClasses({
  size = "md",
  status,
  disabled,
  open,
  range,
  className,
}: {
  size?: TimePickerSize;
  status?: TimePickerStatus;
  disabled?: boolean;
  open?: boolean;
  range?: boolean;
  className?: string;
}) {
  return cn(
    timePickerBaseClass,
    timePickerSizeClasses[size],
    status && timePickerStatusClasses[status],
    disabled && "time-picker-disabled",
    open && "time-picker-open",
    range && timePickerRangeClass,
    className,
  );
}

export function getTimePickerPanelClasses({
  open,
  className,
}: {
  open?: boolean;
  className?: string;
}) {
  return cn(timePickerPanelClass, open && "time-picker-panel-open", className);
}
