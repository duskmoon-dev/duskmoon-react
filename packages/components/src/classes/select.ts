import { cn } from "../utils";
import type {
  SelectSize,
  SelectStatus,
} from "../components/select/Select.types";

export const selectContainerClass = "select-container";
export const selectBaseClass = "select";
export const selectIconClass = "select-icon";
export const selectOpenClass = "select-open";
export const selectLoadingClass = "select-loading";
export const selectFullClass = "select-full";
export const selectOptionClass = "select-option";
export const selectOptionSelectedClass = "select-option-selected";
export const selectOptionDisabledClass = "select-option-disabled";
export const selectDropdownClass = "select-dropdown";
export const selectSearchClass = "select-search";
export const selectSelectionClass = "select-selection";
export const selectTagClass = "select-tag";
export const selectClearClass = "select-clear";
export const selectPlaceholderClass = "select-placeholder";
export const selectEmptyClass = "select-empty";
export const selectGroupClass = "select-group";
export const selectGroupLabelClass = "select-group-label";

export const selectSizeClasses: Record<SelectSize, string> = {
  sm: "select-sm",
  md: "",
  lg: "select-lg",
};

export const selectStatusClasses: Record<SelectStatus, string> = {
  error: "select-error",
  success: "select-success",
};

export function getSelectContainerClasses({
  open,
  loading,
  disabled,
  full,
  className,
}: {
  open?: boolean;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  className?: string;
}) {
  return cn(
    selectContainerClass,
    open && selectOpenClass,
    loading && selectLoadingClass,
    disabled && "select-disabled",
    full && selectFullClass,
    className,
  );
}

export function getSelectClasses({
  size = "md",
  status,
  disabled,
  className,
}: {
  size?: SelectSize;
  status?: SelectStatus;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    selectBaseClass,
    selectSizeClasses[size],
    status && selectStatusClasses[status],
    disabled && "select-disabled",
    className,
  );
}

export function getSelectOptionClasses({
  selected,
  disabled,
  className,
}: {
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    selectOptionClass,
    selected && selectOptionSelectedClass,
    disabled && selectOptionDisabledClass,
    className,
  );
}
