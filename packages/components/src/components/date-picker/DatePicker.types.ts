import type {
  ChangeEvent,
  ComponentProps,
  FocusEvent,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type DatePickerValue = string;
export type DatePickerRangeValue = [DatePickerValue | undefined, DatePickerValue | undefined];
export type DatePickerPicker =
  | "date"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "time";
export type DatePickerSize = "sm" | "md" | "lg";
export type DatePickerStatus = "error" | "success";

export interface DatePickerPreset {
  label: ReactNode;
  value: DatePickerValue;
}

export interface DatePickerProps
  extends Omit<
    ComponentProps<"div">,
    "children" | "defaultValue" | "onBlur" | "onChange" | "onFocus"
  > {
  value?: DatePickerValue;
  defaultValue?: DatePickerValue;
  onChange?: (value: DatePickerValue | undefined, dateString: string) => void;
  onBlur?: (event: DatePickerInputFocusEvent) => void;
  onFocus?: (event: DatePickerInputFocusEvent) => void;
  onOpenChange?: (open: boolean) => void;
  picker?: DatePickerPicker;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledDate?: (value: DatePickerValue) => boolean;
  presets?: DatePickerPreset[];
  showNow?: boolean;
  allowClear?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  size?: DatePickerSize;
  status?: DatePickerStatus;
}

export interface RangePickerProps
  extends Omit<
    DatePickerProps,
    "placeholder" | "value" | "defaultValue" | "onChange"
  > {
  value?: DatePickerRangeValue;
  defaultValue?: DatePickerRangeValue;
  onChange?: (value: DatePickerRangeValue, dateStrings: [string, string]) => void;
  placeholder?: [string, string];
  separator?: ReactNode;
}

export interface DatePickerComponent
  extends ForwardRefExoticComponent<
    DatePickerProps & RefAttributes<HTMLDivElement>
  > {
  RangePicker: ForwardRefExoticComponent<
    RangePickerProps & RefAttributes<HTMLDivElement>
  >;
  WeekPicker: ForwardRefExoticComponent<
    DatePickerProps & RefAttributes<HTMLDivElement>
  >;
  MonthPicker: ForwardRefExoticComponent<
    DatePickerProps & RefAttributes<HTMLDivElement>
  >;
  QuarterPicker: ForwardRefExoticComponent<
    DatePickerProps & RefAttributes<HTMLDivElement>
  >;
  YearPicker: ForwardRefExoticComponent<
    DatePickerProps & RefAttributes<HTMLDivElement>
  >;
}

export type DatePickerInputChangeEvent = ChangeEvent<HTMLInputElement>;
export type DatePickerInputFocusEvent = FocusEvent<HTMLInputElement>;
