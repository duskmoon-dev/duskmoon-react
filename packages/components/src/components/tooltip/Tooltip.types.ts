import type { ComponentProps, ReactNode } from "react";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipSize = "sm" | "md" | "lg";

export interface TooltipProps extends Omit<ComponentProps<"span">, "title"> {
  title?: ReactNode;
  placement?: TooltipPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  /** Called when native interest changes visibility, or a controlled interaction requests it.
   * Controlled tooltips use manual popovers and stay open until `open` changes. */
  onOpenChange?: (open: boolean) => void;
  /** @deprecated Native tooltips follow Core's arrowless automatic placement. */
  arrow?: boolean;
  size?: TooltipSize;
  children: ReactNode;
}
