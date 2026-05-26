import { cn } from "../utils";

export const dmBreadcrumbClass = "dm-breadcrumb";
export const dmBreadcrumbCompactClass = "dm-breadcrumb-compact";
export const dmBreadcrumbRecentClass = "dm-breadcrumb-recent";
export const dmBreadcrumbValueClass = "dm-breadcrumb-value";

export function getDmBreadcrumbClasses({
  compact,
  recent,
  className,
}: {
  compact?: boolean;
  recent?: boolean;
  className?: string;
}) {
  return cn(
    dmBreadcrumbClass,
    compact && dmBreadcrumbCompactClass,
    recent && dmBreadcrumbRecentClass,
    className,
  );
}

