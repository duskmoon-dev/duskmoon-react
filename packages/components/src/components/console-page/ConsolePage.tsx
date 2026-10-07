import { forwardRef } from "react";
import { cn } from "../../utils";
import type { ConsolePageProps } from "./ConsolePage.types";

export const ConsolePage = forwardRef<HTMLDivElement, ConsolePageProps>(
  (
    {
      appBar,
      sidebar,
      sidebarHeader,
      sidebarFooter,
      sidebarMode = "expanded",
      children,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={cn(
        "console-page",
        sidebarMode === "compact" && "console-page-sidebar-compact",
        sidebarMode === "hidden" && "console-page-sidebar-hidden",
        className,
      )}
    >
      <div className="console-page-frame">
        {appBar != null && (
          <header className="console-page-appbar">{appBar}</header>
        )}
        {sidebar != null && (
          <aside className="console-page-sidebar">
            {sidebarHeader != null && (
              <div className="console-page-sidebar-header">{sidebarHeader}</div>
            )}
            <div className="console-page-sidebar-body">{sidebar}</div>
            {sidebarFooter != null && (
              <div className="console-page-sidebar-footer">{sidebarFooter}</div>
            )}
          </aside>
        )}
        <main className="console-page-main">{children}</main>
      </div>
    </div>
  ),
);

ConsolePage.displayName = "ConsolePage";
