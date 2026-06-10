import type { ComponentProps, ReactNode } from "react";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";
export type PopoverTrigger = "hover" | "focus" | "click" | "contextmenu";

export interface PopoverProps
  extends Omit<ComponentProps<"span">, "children" | "content" | "title"> {
  title?: ReactNode;
  content?: ReactNode;
  placement?: PopoverPlacement;
  trigger?: PopoverTrigger;
  open?: boolean;
  defaultOpen?: boolean;
  arrow?: boolean;
  destroyTooltipOnHide?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}
