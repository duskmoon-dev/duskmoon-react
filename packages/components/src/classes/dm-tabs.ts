import { cn } from "../utils";
import type { TabsPosition, TabsType } from "../components/tabs/Tabs.types";

export const dmTabsShellClass = "dm-tabs-shell";
export const dmTabsLineHorizontalClass = "dm-line-horizontal-tabs";
export const dmTabsLineVerticalClass = "dm-line-vertical-tabs";
export const dmTabsCardClass = "dm-card-tabs";
export const dmTabsCardTransparentClass = "dm-card-transparent-tabs";
export const dmTabsOptionTreeClass = "dm-option-tree-tabs";

export function getDmTabsShellClasses({ className }: { className?: string }) {
  return cn(dmTabsShellClass, className);
}

export function getDmTabsClasses({
  type = "line",
  tabPosition = "top",
  transparentCard,
  optionTree,
  className,
}: {
  type?: TabsType;
  tabPosition?: TabsPosition;
  transparentCard?: boolean;
  optionTree?: boolean;
  className?: string;
}) {
  const isVerticalLine =
    type === "line" && (tabPosition === "left" || tabPosition === "right");

  return cn(
    type === "line" &&
      (isVerticalLine ? dmTabsLineVerticalClass : dmTabsLineHorizontalClass),
    type !== "line" &&
      (transparentCard ? dmTabsCardTransparentClass : dmTabsCardClass),
    optionTree && dmTabsOptionTreeClass,
    className,
  );
}
