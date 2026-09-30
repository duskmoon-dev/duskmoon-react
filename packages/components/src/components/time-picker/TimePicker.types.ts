import type {
  ComponentProps,
  FocusEvent,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type TimePickerValue = string | Date;
export type TimePickerRangeValue = [
  TimePickerValue | undefined,
  TimePickerValue | undefined,
];
export type TimePickerSize = "sm" | "md" | "lg";
export type TimePickerStatus = "error" | "success";

export interface DisabledTimeConfig {
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
}

export interface TimePickerProps extends Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onBlur" | "onChange" | "onFocus"
> {
  value?: TimePickerValue;
  defaultValue?: TimePickerValue;
  format?: string;
  disabled?: boolean;
  disabledTime?: (value?: TimePickerValue) => DisabledTimeConfig;
  use12Hours?: boolean;
  showNow?: boolean;
  allowClear?: boolean;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  size?: TimePickerSize;
  status?: TimePickerStatus;
  onChange?: (value: TimePickerValue | undefined, timeString: string) => void;
  onOpenChange?: (open: boolean) => void;
  onBlur?: (event: TimePickerInputFocusEvent) => void;
  onFocus?: (event: TimePickerInputFocusEvent) => void;
}

export interface RangePickerProps extends Omit<
  TimePickerProps,
  "placeholder" | "value" | "defaultValue" | "onChange"
> {
  value?: TimePickerRangeValue;
  defaultValue?: TimePickerRangeValue;
  onChange?: (
    value: TimePickerRangeValue,
    timeStrings: [string, string],
  ) => void;
  placeholder?: [string, string];
  separator?: ReactNode;
}

export interface TimePickerComponent extends ForwardRefExoticComponent<
  TimePickerProps & RefAttributes<HTMLDivElement>
> {
  RangePicker: ForwardRefExoticComponent<
    RangePickerProps & RefAttributes<HTMLDivElement>
  >;
}

export type TimePickerInputFocusEvent = FocusEvent<HTMLInputElement>;
