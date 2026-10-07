import { cn } from "../utils";

export type ConsolePageSidebarState = "expanded" | "compact" | "hidden";

export const consolePageFrameClass = "console-page-frame";
export const consolePageAppbarClass = "console-page-appbar";
export const consolePageSidebarClass = "console-page-sidebar";
export const consolePageSidebarHeaderClass = "console-page-sidebar-header";
export const consolePageSidebarBodyClass = "console-page-sidebar-body";
export const consolePageSidebarFooterClass = "console-page-sidebar-footer";
export const consolePageMainClass = "console-page-main";
export const consolePageNavLabelClass = "console-page-nav-label";
export const consolePageSidebarToggleClass = "console-page-sidebar-toggle";
export const consolePageMenuTriggerClass = "console-page-menu-trigger";
export const consolePageMobileMenuClass = "console-page-mobile-menu";

export function getConsolePageClasses({
  sidebarState = "expanded",
  className,
}: {
  sidebarState?: ConsolePageSidebarState;
  className?: string;
}) {
  return cn(
    "console-page",
    sidebarState !== "expanded" && `console-page-sidebar-${sidebarState}`,
    className,
  );
}
