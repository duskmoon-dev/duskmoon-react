import type { ComponentProps, ReactNode } from "react";

export interface BackTopProps extends Omit<
  ComponentProps<"button">,
  "children"
> {
  visibilityHeight?: number;
  target?: () => Window | HTMLElement | null;
  children?: ReactNode;
}
