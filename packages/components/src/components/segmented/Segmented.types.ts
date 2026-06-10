import type { ComponentProps, ReactNode } from "react";

export type SegmentedValue = string | number;

export type SegmentedSize = "sm" | "md" | "lg";

export interface SegmentedOptionObject {
  label: ReactNode;
  value: SegmentedValue;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export type SegmentedOption = SegmentedValue | SegmentedOptionObject;

export interface SegmentedProps extends Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> {
  options: SegmentedOption[];
  value?: SegmentedValue;
  defaultValue?: SegmentedValue;
  onChange?: (value: SegmentedValue) => void;
  disabled?: boolean;
  block?: boolean;
  size?: SegmentedSize;
}
