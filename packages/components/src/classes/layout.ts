import { cn } from "../utils";

export const layoutBaseClass = "layout";
export const layoutHasSiderClass = "layout-has-sider";
export const layoutHeaderClass = "layout-header";
export const layoutSiderClass = "layout-sider";
export const layoutSiderCollapsedClass = "layout-sider-collapsed";
export const layoutContentClass = "layout-content";
export const layoutFooterClass = "layout-footer";
export const layoutTriggerClass = "layout-trigger";

export function getLayoutClasses({
  hasSider,
  className,
}: {
  hasSider?: boolean;
  className?: string;
}) {
  return cn(layoutBaseClass, hasSider && layoutHasSiderClass, className);
}

export function getLayoutSiderClasses({
  collapsed,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return cn(
    layoutSiderClass,
    collapsed && layoutSiderCollapsedClass,
    className,
  );
}
