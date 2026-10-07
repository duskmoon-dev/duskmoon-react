import type { ComponentProps, ReactNode } from "react";

export type ConsolePageSidebarMode = "expanded" | "compact" | "hidden";

export interface ConsolePageProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  appBar?: ReactNode;
  sidebar?: ReactNode;
  sidebarHeader?: ReactNode;
  sidebarFooter?: ReactNode;
  sidebarMode?: ConsolePageSidebarMode;
  children?: ReactNode;
}
