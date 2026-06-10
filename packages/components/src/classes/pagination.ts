import { cn } from "../utils";
import type { PaginationSize } from "../components/pagination/Pagination.types";

export const paginationBaseClass = "pagination";
export const paginationItemClass = "pagination-item";
export const paginationItemActiveClass = "pagination-item-active";
export const paginationItemDisabledClass = "pagination-item-disabled";
export const paginationPrevClass = "pagination-prev";
export const paginationNextClass = "pagination-next";
export const paginationEllipsisClass = "pagination-ellipsis";
export const paginationCompactClass = "pagination-compact";
export const paginationInfoClass = "pagination-info";
export const paginationInfoTextClass = "pagination-info-text";
export const paginationInputClass = "pagination-input";
export const paginationResponsiveClass = "pagination-responsive";

export const paginationSizeClasses: Record<PaginationSize, string> = {
  sm: "pagination-sm",
  md: "",
  lg: "pagination-lg",
};

export function getPaginationClasses({
  size = "md",
  compact,
  className,
}: {
  size?: PaginationSize;
  compact?: boolean;
  className?: string;
}) {
  return cn(
    paginationBaseClass,
    paginationResponsiveClass,
    paginationSizeClasses[size],
    compact && paginationCompactClass,
    className,
  );
}

export function getPaginationItemClasses({
  active,
  disabled,
}: {
  active?: boolean;
  disabled?: boolean;
}) {
  return cn(
    paginationItemClass,
    active && paginationItemActiveClass,
    disabled && paginationItemDisabledClass,
  );
}
