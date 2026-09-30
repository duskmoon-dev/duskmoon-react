import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { DatePickerProps, RangePickerProps } from "../date-picker";

export type DmDatePickerProps = DatePickerProps;
export type DmRangePickerProps = RangePickerProps;

export interface DmDatePickerComponent extends ForwardRefExoticComponent<
  DmDatePickerProps & RefAttributes<HTMLDivElement>
> {
  RangePicker: ForwardRefExoticComponent<
    DmRangePickerProps & RefAttributes<HTMLDivElement>
  >;
  WeekPicker: ForwardRefExoticComponent<
    DmDatePickerProps & RefAttributes<HTMLDivElement>
  >;
  MonthPicker: ForwardRefExoticComponent<
    DmDatePickerProps & RefAttributes<HTMLDivElement>
  >;
  QuarterPicker: ForwardRefExoticComponent<
    DmDatePickerProps & RefAttributes<HTMLDivElement>
  >;
  YearPicker: ForwardRefExoticComponent<
    DmDatePickerProps & RefAttributes<HTMLDivElement>
  >;
}
