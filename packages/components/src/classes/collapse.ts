import { cn } from "../utils";
import type { CollapseSize } from "../components/collapse/Collapse.types";

export const collapseGroupClass = "collapse-group";
export const collapseBaseClass = "collapse";
export const collapseOpenClass = "collapse-open";
export const collapseClosedClass = "collapse-closed";
export const collapseTriggerClass = "collapse-trigger";
export const collapseIconClass = "collapse-icon";
export const collapseContentClass = "collapse-content";
export const collapseBorderedClass = "collapse-bordered";
export const collapseGhostClass = "collapse-ghost";
export const collapseDisabledClass = "collapse-disabled";

export const collapseSizeClasses: Record<CollapseSize, string> = {
  sm: "collapse-sm",
  md: "",
  lg: "collapse-lg",
};

export function getCollapseGroupClasses({ className }: { className?: string }) {
  return cn(collapseGroupClass, className);
}

export function getCollapseItemClasses({
  open,
  bordered,
  ghost,
  disabled,
  size = "md",
  className,
}: {
  open?: boolean;
  bordered?: boolean;
  ghost?: boolean;
  disabled?: boolean;
  size?: CollapseSize;
  className?: string;
}) {
  return cn(
    collapseBaseClass,
    open ? collapseOpenClass : collapseClosedClass,
    bordered && collapseBorderedClass,
    ghost && collapseGhostClass,
    disabled && collapseDisabledClass,
    collapseSizeClasses[size],
    className,
  );
}
