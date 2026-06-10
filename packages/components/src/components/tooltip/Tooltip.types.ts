import type { ComponentProps, ReactNode } from "react";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipSize = "sm" | "md" | "lg";

export interface TooltipProps extends Omit<ComponentProps<"span">, "title"> {
  title?: ReactNode;
  placement?: TooltipPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  arrow?: boolean;
  size?: TooltipSize;
  children: ReactNode;
}
