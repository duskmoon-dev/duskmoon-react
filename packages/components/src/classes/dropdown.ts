import { cn } from "../utils";
import type { DropdownPlacement } from "../components/dropdown/Dropdown.types";

export const dropdownWrapperClass = "dropdown-wrapper";
export const dropdownBaseClass = "popover dropdown";
export const dropdownOpenClass = "popover-show dropdown-open";
export const dropdownArrowClass = "popover-arrow dropdown-arrow";
export const dropdownMenuClass = "menu dropdown-menu";
export const dropdownButtonClass = "dropdown-button";

export const dropdownPlacementClasses: Record<DropdownPlacement, string> = {
  top: "popover-top dropdown-top",
  bottom: "popover-bottom dropdown-bottom",
  left: "popover-left dropdown-left",
  right: "popover-right dropdown-right",
  topLeft: "popover-top dropdown-top-left",
  topRight: "popover-top dropdown-top-right",
  bottomLeft: "popover-bottom dropdown-bottom-left",
  bottomRight: "popover-bottom dropdown-bottom-right",
};

export function getDropdownClasses({
  placement = "bottomLeft",
  open,
  arrow,
  className,
}: {
  placement?: DropdownPlacement;
  open?: boolean;
  arrow?: boolean;
  className?: string;
}) {
  return cn(
    dropdownBaseClass,
    dropdownPlacementClasses[placement],
    open && dropdownOpenClass,
    !arrow && "popover-no-arrow dropdown-no-arrow",
    className,
  );
}
