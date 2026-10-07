import { cn } from "../utils";
import type { DropdownPlacement } from "../components/dropdown/Dropdown.types";

export const dropdownWrapperClass = "dropdown";
export const dropdownBaseClass = "dropdown-content";
export const dropdownOpenClass = "";
export const dropdownArrowClass = "dropdown-arrow";
export const dropdownMenuClass = "menu dropdown-menu";
export const dropdownButtonClass = "dropdown-button";

export const dropdownPlacementClasses: Record<DropdownPlacement, string> = {
  top: "dropdown-block-start",
  bottom: "dropdown-block-end",
  left: "dropdown-inline-start",
  right: "dropdown-inline-end",
  topLeft: "dropdown-block-start",
  topRight: "dropdown-block-start",
  bottomLeft: "dropdown-block-end",
  bottomRight: "dropdown-block-end",
};

export function getDropdownClasses({
  className,
}: {
  placement?: DropdownPlacement;
  open?: boolean;
  arrow?: boolean;
  className?: string;
}) {
  return cn(dropdownBaseClass, className);
}
