import { cn } from "../utils";

export const dmSearchBaseClass = "dm-search";
export const dmSearchCompactClass = "dm-search-compact";
export const dmSearchCollapsedClass = "dm-search-collapsed";
export const dmSearchFieldsClass = "dm-search-fields";
export const dmSearchFieldClass = "dm-search-field";
export const dmSearchActionsClass = "dm-search-actions";
export const dmSearchFastFilterClass = "dm-search-fast-filter";

export function getDmSearchClasses({
  compact,
  collapsed,
  className,
}: {
  compact?: boolean;
  collapsed?: boolean;
  className?: string;
}) {
  return cn(
    dmSearchBaseClass,
    compact && dmSearchCompactClass,
    collapsed && dmSearchCollapsedClass,
    className,
  );
}
