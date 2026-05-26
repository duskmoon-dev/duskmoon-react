import { cn } from "../utils";

export const dmToolbarBaseClass = "dm-toolbar";
export const dmToolbarItemClass = "dm-toolbar-item";
export const dmToolbarPrimaryItemClass = "dm-toolbar-primary-item";
export const dmToolbarSecondaryItemClass = "dm-toolbar-secondary-item";
export const dmToolbarMoreClass = "dm-toolbar-more";

export function getDmToolbarClasses({
  className,
}: {
  className?: string;
}) {
  return cn(dmToolbarBaseClass, className);
}

export function getDmToolbarItemClasses({
  primary,
  className,
}: {
  primary?: boolean;
  className?: string;
}) {
  return cn(
    dmToolbarItemClass,
    primary ? dmToolbarPrimaryItemClass : dmToolbarSecondaryItemClass,
    className,
  );
}
