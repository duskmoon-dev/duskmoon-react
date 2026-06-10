import { cn } from "../utils";

export const dmLayoutClass = "dm-layout";
export const dmLayoutShellClass = "dm-layout-shell";
export const dmLayoutMainClass = "dm-layout-main";
export const dmLayoutSiderClass = "dm-layout-sider";
export const dmLayoutBodyClass = "dm-layout-body";
export const dmLayoutBreadcrumbClass = "dm-layout-breadcrumb";
export const dmLayoutContentClass = "dm-layout-content";
export const dmLayoutAuxiliaryClass = "dm-layout-auxiliary";

export function getDmLayoutClasses({ className }: { className?: string }) {
  return cn(dmLayoutClass, className);
}

