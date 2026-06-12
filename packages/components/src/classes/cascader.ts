import { cn } from "../utils";
import type {
  CascaderSize,
  CascaderStatus,
} from "../components/cascader/Cascader.types";

export const cascaderContainerClass = "cascader-container";
export const cascaderBaseClass = "cascader";
export const cascaderOpenClass = "cascader-open";
export const cascaderDisabledClass = "cascader-disabled";
export const cascaderSelectionClass = "cascader-selection";
export const cascaderPlaceholderClass = "cascader-placeholder";
export const cascaderClearClass = "cascader-clear";
export const cascaderIconClass = "cascader-icon";
export const cascaderDropdownClass = "cascader-dropdown";
export const cascaderSearchClass = "cascader-search";
export const cascaderMenusClass = "cascader-menus";
export const cascaderMenuClass = "cascader-menu";
export const cascaderOptionClass = "cascader-option";
export const cascaderOptionActiveClass = "cascader-option-active";
export const cascaderOptionSelectedClass = "cascader-option-selected";
export const cascaderOptionDisabledClass = "cascader-option-disabled";
export const cascaderOptionLoadingClass = "cascader-option-loading";
export const cascaderOptionExpandClass = "cascader-option-expand";
export const cascaderEmptyClass = "cascader-empty";
export const cascaderTagClass = "cascader-tag";

export const cascaderSizeClasses: Record<CascaderSize, string> = {
  small: "cascader-sm",
  middle: "",
  large: "cascader-lg",
};

export const cascaderStatusClasses: Record<CascaderStatus, string> = {
  error: "cascader-error",
  warning: "cascader-warning",
};

export function getCascaderContainerClasses({
  open,
  disabled,
  className,
}: {
  open?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    cascaderContainerClass,
    open && cascaderOpenClass,
    disabled && cascaderDisabledClass,
    className,
  );
}

export function getCascaderClasses({
  size = "middle",
  status,
  disabled,
  className,
}: {
  size?: CascaderSize;
  status?: CascaderStatus;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    cascaderBaseClass,
    cascaderSizeClasses[size],
    status && cascaderStatusClasses[status],
    disabled && cascaderDisabledClass,
    className,
  );
}

export function getCascaderOptionClasses({
  active,
  selected,
  disabled,
  loading,
  expand,
  className,
}: {
  active?: boolean;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  expand?: boolean;
  className?: string;
}) {
  return cn(
    cascaderOptionClass,
    active && cascaderOptionActiveClass,
    selected && cascaderOptionSelectedClass,
    disabled && cascaderOptionDisabledClass,
    loading && cascaderOptionLoadingClass,
    expand && cascaderOptionExpandClass,
    className,
  );
}
