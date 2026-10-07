import { cn } from "../utils";
import type { PopoverPlacement } from "../components/popover/Popover.types";

export const popoverWrapperClass = "popover-wrapper";
export const popoverBaseClass = "popover";
export const popoverArrowClass = "popover-arrow";
export const popoverNoArrowClass = "popover-no-arrow";

export const popoverPlacementClasses: Record<PopoverPlacement, string> = {
  top: "popover-top",
  bottom: "popover-bottom",
  left: "popover-left",
  right: "popover-right",
};

export function getPopoverClasses({
  placement = "top",
  arrow = true,
  className,
}: {
  placement?: PopoverPlacement;
  arrow?: boolean;
  className?: string;
}) {
  return cn(
    popoverBaseClass,
    popoverPlacementClasses[placement],
    !arrow && popoverNoArrowClass,
    className,
  );
}
