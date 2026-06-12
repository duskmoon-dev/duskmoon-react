import { cn } from "../utils";

export const dmMenuClass = "dm-menu";
export const dmMenuNoHeaderClass = "dm-menu-no-header";
export const dmMenuCollapsedClass = "dm-menu-collapsed";
export const dmMenuHeaderClass = "dm-menu-header";
export const dmMenuProductIconClass = "dm-menu-product-icon";
export const dmMenuContentClass = "dm-menu-content";
export const dmMenuFooterClass = "dm-menu-footer";
export const dmMenuCollapseButtonClass = "dm-menu-collapse-button";

export function getDmMenuClasses({
  hideProductHeader,
  inlineCollapsed,
  className,
}: {
  hideProductHeader?: boolean;
  inlineCollapsed?: boolean;
  className?: string;
}) {
  return cn(
    dmMenuClass,
    hideProductHeader && dmMenuNoHeaderClass,
    inlineCollapsed && dmMenuCollapsedClass,
    className,
  );
}
