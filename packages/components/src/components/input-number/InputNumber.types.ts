import type { ComponentProps } from "react";

export type InputNumberValue = number | null;
export type InputNumberSize = "sm" | "md" | "lg";
export type InputNumberStatus = "error" | "success";

export interface InputNumberProps
  extends Omit<
    ComponentProps<"input">,
    "children" | "defaultValue" | "onChange" | "size" | "status" | "value"
  > {
  value?: InputNumberValue;
  defaultValue?: InputNumberValue;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  formatter?: (value: InputNumberValue) => string;
  parser?: (displayValue: string) => InputNumberValue;
  controls?: boolean;
  keyboard?: boolean;
  status?: InputNumberStatus;
  size?: InputNumberSize;
  onChange?: (value: InputNumberValue) => void;
  onStep?: (value: InputNumberValue, info: { offset: number; type: "up" | "down" }) => void;
}
