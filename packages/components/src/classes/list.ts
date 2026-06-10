import type { ListSize } from "../components/list/List.types";
import { cn } from "../utils";

export const listBaseClass = "list";
export const listBorderedClass = "list-bordered";
export const listItemClass = "list-item";
export const listItemInteractiveClass = "list-item-interactive";
export const listItemDisabledClass = "list-item-disabled";
export const listItemContentClass = "list-item-content";
export const listItemTextClass = "list-item-text";
export const listItemSecondaryClass = "list-item-secondary";
export const listItemLeadingClass = "list-item-leading";
export const listItemTrailingClass = "list-item-trailing";

export const listSizeClasses: Record<ListSize, string> = {
  sm: "list-compact",
  md: "",
  lg: "list-comfortable",
};

export function getListClasses({
  bordered,
  size = "md",
  className,
}: {
  bordered?: boolean;
  size?: ListSize;
  className?: string;
}) {
  return cn(
    listBaseClass,
    bordered && listBorderedClass,
    listSizeClasses[size],
    className,
  );
}

export function getListItemClasses({
  interactive,
  disabled,
  className,
}: {
  interactive?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    listItemClass,
    interactive && !disabled && listItemInteractiveClass,
    disabled && listItemDisabledClass,
    className,
  );
}
