import { cn } from "../utils";

export const breadcrumbBaseClass = "breadcrumbs";
export const breadcrumbItemClass = "breadcrumb-item";
export const breadcrumbItemActiveClass = "breadcrumb-item-active";
export const breadcrumbItemDisabledClass = "breadcrumb-item-disabled";
export const breadcrumbLinkClass = "breadcrumb-link";
export const breadcrumbSeparatorClass = "breadcrumb-separator";
export const breadcrumbIconClass = "breadcrumb-icon";
export const breadcrumbEllipsisClass = "breadcrumb-ellipsis";
export const breadcrumbMenuClass = "breadcrumb-menu";
export const breadcrumbMenuListClass = "breadcrumb-menu-list";
export const breadcrumbMenuItemClass = "breadcrumb-menu-item";

export function getBreadcrumbClasses({ className }: { className?: string }) {
  return cn(breadcrumbBaseClass, className);
}

export function getBreadcrumbItemClasses({
  active,
  disabled,
  className,
}: {
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    breadcrumbItemClass,
    active && breadcrumbItemActiveClass,
    disabled && breadcrumbItemDisabledClass,
    className,
  );
}

export function getBreadcrumbLinkClasses({
  disabled,
  className,
}: {
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    breadcrumbLinkClass,
    disabled && breadcrumbItemDisabledClass,
    className,
  );
}
