import { cn } from "../utils";
import type {
  TabsPosition,
  TabsSize,
  TabsType,
} from "../components/tabs/Tabs.types";

export const tabsRootClass = "tabs-root";
export const tabsRootVerticalClass = "tabs-root-vertical";
export const tabsRootBottomClass = "tabs-root-bottom";
export const tabsRootRightClass = "tabs-root-right";
export const tabsBarClass = "tabs-bar";
export const tabsBaseClass = "tabs";
export const tabsVerticalClass = "tabs-vertical";
export const tabsScrollableClass = "tabs-scrollable";
export const tabsCenteredClass = "tabs-center";
export const tabsBoxedClass = "tabs-boxed";
export const tabBaseClass = "tab";
export const tabActiveClass = "tab-active";
export const tabDisabledClass = "tab-disabled";
export const tabIconClass = "tab-icon";
export const tabIconOnlyClass = "tab-icon-only";
export const tabPanelClass = "tab-panel";
export const tabPanelShowClass = "tab-panel-show";
export const tabsAddClass = "tab tab-add";
export const tabsCloseClass = "tab-icon tab-close";

export const tabsSizeClasses: Record<TabsSize, string> = {
  small: "tabs-sm",
  middle: "tabs-md",
  large: "tabs-lg",
  sm: "tabs-sm",
  md: "tabs-md",
  lg: "tabs-lg",
};

export const tabsTypeClasses: Record<TabsType, string> = {
  line: "",
  card: tabsBoxedClass,
  "editable-card": tabsBoxedClass,
};

export function getTabsRootClasses({
  tabPosition = "top",
  className,
}: {
  tabPosition?: TabsPosition;
  className?: string;
}) {
  return cn(
    tabsRootClass,
    (tabPosition === "left" || tabPosition === "right") &&
      tabsRootVerticalClass,
    tabPosition === "bottom" && tabsRootBottomClass,
    tabPosition === "right" && tabsRootRightClass,
    className,
  );
}

export function getTabsListClasses({
  tabPosition = "top",
  type = "line",
  size = "middle",
  centered,
}: {
  tabPosition?: TabsPosition;
  type?: TabsType;
  size?: TabsSize;
  centered?: boolean;
}) {
  return cn(
    tabsBaseClass,
    tabsScrollableClass,
    (tabPosition === "left" || tabPosition === "right") && tabsVerticalClass,
    tabsSizeClasses[size],
    tabsTypeClasses[type],
    centered && tabsCenteredClass,
  );
}

export function getTabClasses({
  active,
  disabled,
  iconOnly,
  className,
}: {
  active?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  return cn(
    tabBaseClass,
    active && tabActiveClass,
    disabled && tabDisabledClass,
    iconOnly && tabIconOnlyClass,
    className,
  );
}

export function getTabPanelClasses({
  active,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return cn(tabPanelClass, active && tabPanelShowClass, className);
}
