import type { SplitterLayout } from "../components/splitter/Splitter.types";
import { cn } from "../utils";

export const splitterBaseClass = "splitter";
export const splitterPanelClass = "splitter-panel";
export const splitterPanelCollapsedClass = "splitter-panel-collapsed";
export const splitterHandleClass = "splitter-handle";
export const splitterHandleDisabledClass = "splitter-handle-disabled";

export const splitterLayoutClasses: Record<SplitterLayout, string> = {
  horizontal: "splitter-horizontal",
  vertical: "splitter-vertical",
};

export function getSplitterClasses({
  layout,
  className,
}: {
  layout: SplitterLayout;
  className?: string;
}) {
  return cn(splitterBaseClass, splitterLayoutClasses[layout], className);
}

export function getSplitterPanelClasses({
  collapsed,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return cn(
    splitterPanelClass,
    collapsed && splitterPanelCollapsedClass,
    className,
  );
}

export function getSplitterHandleClasses({
  disabled,
  className,
}: {
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    splitterHandleClass,
    disabled && splitterHandleDisabledClass,
    className,
  );
}
