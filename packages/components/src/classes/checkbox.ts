import { cn } from "../utils";
import type {
  CheckboxColor,
  CheckboxLabelPosition,
  CheckboxSize,
} from "../components/checkbox/Checkbox.types";

export const checkboxBaseClass = "checkbox";
export const checkboxInputClass = "checkbox-input";
export const checkboxBoxBaseClass = "checkbox-box";
export const checkboxCheckmarkClass = "checkbox-checkmark";
export const checkboxLabelBaseClass = "checkbox-label";

export const checkboxColorClasses: Record<CheckboxColor, string> = {
  primary: "checkbox-primary",
  secondary: "checkbox-secondary",
  tertiary: "checkbox-tertiary",
};

export const checkboxSizeClasses: Record<CheckboxSize, string> = {
  sm: "checkbox-sm",
  md: "",
  lg: "checkbox-lg",
};

export const checkboxLabelPositionClasses: Record<
  CheckboxLabelPosition,
  string
> = {
  left: "checkbox-label-left",
  right: "",
};

export const checkboxErrorClass = "checkbox-error";
export const checkboxLoadingClass = "checkbox-loading";

export function getCheckboxClasses({
  size = "md",
  error,
  loading,
  className,
}: {
  size?: CheckboxSize;
  error?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return cn(
    checkboxBaseClass,
    checkboxSizeClasses[size],
    error && checkboxErrorClass,
    loading && checkboxLoadingClass,
    className,
  );
}

export function getCheckboxBoxClasses({
  color = "primary",
}: {
  color?: CheckboxColor;
}) {
  return cn(checkboxBoxBaseClass, checkboxColorClasses[color]);
}

export function getCheckboxLabelClasses({
  labelPosition = "right",
}: {
  labelPosition?: CheckboxLabelPosition;
}) {
  return cn(
    checkboxLabelBaseClass,
    checkboxLabelPositionClasses[labelPosition],
  );
}
