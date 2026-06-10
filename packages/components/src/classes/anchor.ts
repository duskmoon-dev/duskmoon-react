import { cn } from "../utils";

export const anchorBaseClass = "anchor";
export const anchorFixedClass = "anchor-fixed";
export const anchorInkClass = "anchor-ink";
export const anchorInkVisibleClass = "anchor-ink-visible";
export const anchorListClass = "anchor-list";
export const anchorLinkClass = "anchor-link";
export const anchorLinkActiveClass = "anchor-link-active";
export const anchorLinkTitleClass = "anchor-link-title";

export function getAnchorClasses({
  fixed,
  className,
}: {
  fixed?: boolean;
  className?: string;
}) {
  return cn(anchorBaseClass, fixed && anchorFixedClass, className);
}

export function getAnchorInkClasses({ visible }: { visible?: boolean }) {
  return cn(anchorInkClass, visible && anchorInkVisibleClass);
}

export function getAnchorLinkClasses({
  active,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return cn(anchorLinkClass, active && anchorLinkActiveClass, className);
}
