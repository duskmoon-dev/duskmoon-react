import { cn } from "../utils";
import type {
  CheckboxColor,
  CheckboxLabelPosition,
  CheckboxSize,
} from "../components/checkbox/Checkbox.types";

export const checkboxBaseClass = "checkbox-wrapper";
export const checkboxInputBaseClass = "checkbox";
export const checkboxInputClass = "checkbox-input";
export const checkboxBoxBaseClass = "checkbox-box";
export const checkboxCheckmarkClass = "checkbox-checkmark";
export const checkboxLabelBaseClass = "checkbox-text";

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
  loading,
  className,
}: {
  loading?: boolean;
  className?: string;
}) {
  return cn(
    "checkbox-label",
    checkboxBaseClass,
    loading && checkboxLoadingClass,
    className,
  );
}

export function getCheckboxInputClasses({
  color = "primary",
  size = "md",
  error,
}: {
  color?: CheckboxColor;
  size?: CheckboxSize;
  error?: boolean;
}) {
  return cn(
    checkboxInputBaseClass,
    checkboxInputClass,
    checkboxColorClasses[color],
    checkboxSizeClasses[size],
    error && checkboxErrorClass,
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
