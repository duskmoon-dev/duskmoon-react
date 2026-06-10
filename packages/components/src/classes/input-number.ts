import { cn } from "../utils";
import type {
  InputNumberSize,
  InputNumberStatus,
} from "../components/input-number/InputNumber.types";

export const inputNumberBaseClass = "input-number";
export const inputNumberInputClass = "input-number-input";
export const inputNumberControlsClass = "input-number-controls";
export const inputNumberControlClass = "input-number-control";
export const inputNumberDisabledClass = "input-number-disabled";

export const inputNumberSizeClasses: Record<InputNumberSize, string> = {
  sm: "input-number-sm",
  md: "",
  lg: "input-number-lg",
};

export const inputNumberStatusClasses: Record<InputNumberStatus, string> = {
  error: "input-number-error",
  success: "input-number-success",
};

export function getInputNumberClasses({
  size = "md",
  status,
  disabled,
  className,
}: {
  size?: InputNumberSize;
  status?: InputNumberStatus;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    inputNumberBaseClass,
    inputNumberSizeClasses[size],
    status && inputNumberStatusClasses[status],
    disabled && inputNumberDisabledClass,
    className,
  );
}
