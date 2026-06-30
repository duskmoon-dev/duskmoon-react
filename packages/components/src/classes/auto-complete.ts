import { cn } from "../utils";
import type {
  AutoCompleteColor,
  AutoCompleteSize,
} from "../components/auto-complete/AutoComplete.types";

export const autoCompleteBaseClass = "autocomplete";
export const autoCompleteInputWrapperClass = "autocomplete-input-wrapper";
export const autoCompleteInputClass = "autocomplete-input";
export const autoCompleteToggleClass = "autocomplete-toggle";
export const autoCompleteDropdownClass = "autocomplete-dropdown";
export const autoCompleteDropdownOpenClass = "autocomplete-dropdown-open";
export const autoCompleteOptionsClass = "autocomplete-options";
export const autoCompleteOptionClass = "autocomplete-option";
export const autoCompleteOptionSelectedClass = "autocomplete-option-selected";
export const autoCompleteOptionFocusedClass = "autocomplete-option-focused";
export const autoCompleteOptionDisabledClass = "autocomplete-option-disabled";
export const autoCompleteClearClass = "autocomplete-clear";
export const autoCompleteNoOptionsClass = "autocomplete-no-options";

export const autoCompleteColorClasses: Record<AutoCompleteColor, string> = {
  primary: "autocomplete-primary",
  secondary: "autocomplete-secondary",
  tertiary: "autocomplete-tertiary",
  info: "autocomplete-info",
  success: "autocomplete-success",
  warning: "autocomplete-warning",
  error: "autocomplete-error",
};

export const autoCompleteSizeClasses: Record<AutoCompleteSize, string> = {
  sm: "autocomplete-sm",
  md: "",
  lg: "autocomplete-lg",
};

export function getAutoCompleteClasses({
  color,
  disabled,
  open,
  className,
}: {
  color?: AutoCompleteColor;
  disabled?: boolean;
  open?: boolean;
  className?: string;
}) {
  return cn(
    autoCompleteBaseClass,
    color && autoCompleteColorClasses[color],
    disabled && "autocomplete-disabled",
    open && "autocomplete-open",
    className,
  );
}

export function getAutoCompleteInputClasses({
  size = "md",
  className,
}: {
  size?: AutoCompleteSize;
  className?: string;
}) {
  return cn(autoCompleteInputClass, autoCompleteSizeClasses[size], className);
}

export function getAutoCompleteDropdownClasses({
  open,
  className,
}: {
  open?: boolean;
  className?: string;
}) {
  return cn(
    autoCompleteDropdownClass,
    open && autoCompleteDropdownOpenClass,
    className,
  );
}

export function getAutoCompleteOptionClasses({
  selected,
  focused,
  disabled,
  className,
}: {
  selected?: boolean;
  focused?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    autoCompleteOptionClass,
    selected && autoCompleteOptionSelectedClass,
    focused && autoCompleteOptionFocusedClass,
    disabled && autoCompleteOptionDisabledClass,
    className,
  );
}
