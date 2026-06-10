import { cn } from "../utils";
import type {
  RadioColor,
  RadioLabelPosition,
  RadioSize,
} from "../components/radio/Radio.types";

export const radioBaseClass = "radio";
export const radioInputClass = "radio-input";
export const radioCircleBaseClass = "radio-circle";
export const radioDotClass = "radio-dot";
export const radioLabelBaseClass = "radio-label";

export const radioColorClasses: Record<RadioColor, string> = {
  primary: "radio-primary",
  secondary: "radio-secondary",
  tertiary: "radio-tertiary",
};

export const radioSizeClasses: Record<RadioSize, string> = {
  sm: "radio-sm",
  md: "",
  lg: "radio-lg",
};

export const radioLabelPositionClasses: Record<RadioLabelPosition, string> = {
  left: "radio-label-left",
  right: "",
};

export const radioErrorClass = "radio-error";
export const radioLoadingClass = "radio-loading";

export function getRadioClasses({
  size = "md",
  error,
  loading,
  className,
}: {
  size?: RadioSize;
  error?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return cn(
    radioBaseClass,
    radioSizeClasses[size],
    error && radioErrorClass,
    loading && radioLoadingClass,
    className,
  );
}

export function getRadioCircleClasses({
  color = "primary",
}: {
  color?: RadioColor;
}) {
  return cn(radioCircleBaseClass, radioColorClasses[color]);
}

export function getRadioLabelClasses({
  labelPosition = "right",
}: {
  labelPosition?: RadioLabelPosition;
}) {
  return cn(radioLabelBaseClass, radioLabelPositionClasses[labelPosition]);
}
