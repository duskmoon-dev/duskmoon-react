import React, {
  createContext,
  forwardRef,
  useContext,
  useId,
  type CSSProperties,
} from "react";
import {
  consolePageAppbarClass,
  consolePageFrameClass,
  consolePageMainClass,
  consolePageMenuTriggerClass,
  consolePageMobileMenuClass,
  consolePageSidebarBodyClass,
  consolePageSidebarClass,
  consolePageSidebarFooterClass,
  consolePageSidebarHeaderClass,
  consolePageSidebarToggleClass,
  getConsolePageClasses,
  type ConsolePageSidebarState,
} from "../../classes/console-page";
import { cn } from "../../utils";
import type {
  ConsolePageAppbarProps,
  ConsolePageButtonProps,
  ConsolePageComponent,
  ConsolePageFrameProps,
  ConsolePageMainProps,
  ConsolePageProps,
  ConsolePageSidebarBodyProps,
  ConsolePageSidebarProps,
} from "./ConsolePage.types";

const ConsolePageContext = createContext<{
  menuId: string;
  anchor: string;
  sidebarState: ConsolePageSidebarState;
} | null>(null);

function useConsolePage() {
  const context = useContext(ConsolePageContext);
  if (!context)
    throw new Error("ConsolePage controls must be inside ConsolePage");
  return context;
}

const Frame = forwardRef<HTMLDivElement, ConsolePageFrameProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(consolePageFrameClass, className)}
    />
  ),
);
Frame.displayName = "ConsolePage.Frame";

const Appbar = forwardRef<HTMLElement, ConsolePageAppbarProps>(
  ({ className, ...props }, ref) => (
    <header
      {...props}
      ref={ref}
      className={cn(consolePageAppbarClass, "appbar", className)}
    />
  ),
);
Appbar.displayName = "ConsolePage.Appbar";

const Sidebar = forwardRef<HTMLElement, ConsolePageSidebarProps>(
  ({ className, ...props }, ref) => (
    <aside
      {...props}
      ref={ref}
      className={cn(consolePageSidebarClass, className)}
    />
  ),
);
Sidebar.displayName = "ConsolePage.Sidebar";

const SidebarHeader = forwardRef<HTMLDivElement, ConsolePageFrameProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(consolePageSidebarHeaderClass, className)}
    />
  ),
);
SidebarHeader.displayName = "ConsolePage.SidebarHeader";

const SidebarBody = forwardRef<HTMLElement, ConsolePageSidebarBodyProps>(
  ({ className, ...props }, ref) => (
    <nav
      {...props}
      ref={ref}
      className={cn(consolePageSidebarBodyClass, className)}
    />
  ),
);
SidebarBody.displayName = "ConsolePage.SidebarBody";

const SidebarFooter = forwardRef<HTMLDivElement, ConsolePageFrameProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(consolePageSidebarFooterClass, className)}
    />
  ),
);
SidebarFooter.displayName = "ConsolePage.SidebarFooter";

const Main = forwardRef<HTMLElement, ConsolePageMainProps>(
  ({ className, ...props }, ref) => (
    <main
      {...props}
      ref={ref}
      className={cn(consolePageMainClass, className)}
    />
  ),
);
Main.displayName = "ConsolePage.Main";

const SidebarToggle = forwardRef<HTMLButtonElement, ConsolePageButtonProps>(
  ({ className, type = "button", "aria-label": ariaLabel, ...props }, ref) => {
    const { sidebarState } = useConsolePage();
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        aria-label={
          ariaLabel ??
          (sidebarState === "expanded"
            ? "Compact sidebar"
            : sidebarState === "compact"
              ? "Hide sidebar"
              : "Show sidebar")
        }
        className={cn(
          consolePageSidebarToggleClass,
          "appbar-action",
          className,
        )}
      />
    );
  },
);
SidebarToggle.displayName = "ConsolePage.SidebarToggle";

const MobileTrigger = forwardRef<HTMLButtonElement, ConsolePageButtonProps>(
  ({ className, type = "button", style, ...props }, ref) => {
    const { menuId, anchor } = useConsolePage();
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        popoverTarget={menuId}
        style={{ ...style, anchorName: anchor } as CSSProperties}
        className={cn(consolePageMenuTriggerClass, "appbar-action", className)}
      />
    );
  },
);
MobileTrigger.displayName = "ConsolePage.MobileTrigger";

const MobileMenu = forwardRef<HTMLElement, ConsolePageSidebarBodyProps>(
  ({ className, style, ...props }, ref) => {
    const { menuId, anchor } = useConsolePage();
    return (
      <nav
        {...props}
        ref={ref}
        id={menuId}
        popover="auto"
        style={{ ...style, positionAnchor: anchor } as CSSProperties}
        className={cn(
          consolePageMobileMenuClass,
          "menu menu-vertical popover popover-start popover-no-arrow",
          className,
        )}
      />
    );
  },
);
MobileMenu.displayName = "ConsolePage.MobileMenu";

const ConsolePageRoot = forwardRef<HTMLDivElement, ConsolePageProps>(
  (
    {
      sidebarState,
      sidebarMode,
      appBar,
      sidebar,
      sidebarHeader,
      sidebarFooter,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const key = useId().replace(/:/g, "");
    const state = sidebarState ?? sidebarMode ?? "expanded";
    const hasSlots = appBar != null || sidebar != null;
    return (
      <ConsolePageContext.Provider
        value={{
          menuId: `console-page-menu-${key}`,
          anchor: `--console-page-anchor-${key}`,
          sidebarState: state,
        }}
      >
        <div
          {...props}
          ref={ref}
          className={getConsolePageClasses({ sidebarState: state, className })}
        >
          {hasSlots ? (
            <Frame>
              {appBar != null && <Appbar>{appBar}</Appbar>}
              {sidebar != null && (
                <Sidebar>
                  {sidebarHeader != null && (
                    <SidebarHeader>{sidebarHeader}</SidebarHeader>
                  )}
                  <div className={consolePageSidebarBodyClass}>{sidebar}</div>
                  {sidebarFooter != null && (
                    <SidebarFooter>{sidebarFooter}</SidebarFooter>
                  )}
                </Sidebar>
              )}
              <Main>{children}</Main>
            </Frame>
          ) : (
            children
          )}
        </div>
      </ConsolePageContext.Provider>
    );
  },
) as ConsolePageComponent;
ConsolePageRoot.displayName = "ConsolePage";
ConsolePageRoot.Frame = Frame;
ConsolePageRoot.Appbar = Appbar;
ConsolePageRoot.Sidebar = Sidebar;
ConsolePageRoot.SidebarHeader = SidebarHeader;
ConsolePageRoot.SidebarBody = SidebarBody;
ConsolePageRoot.SidebarFooter = SidebarFooter;
ConsolePageRoot.Main = Main;
ConsolePageRoot.SidebarToggle = SidebarToggle;
ConsolePageRoot.MobileTrigger = MobileTrigger;
ConsolePageRoot.MobileMenu = MobileMenu;

export const ConsolePage = ConsolePageRoot;
