import { cn } from "../utils";
import type {
  TooltipPlacement,
  TooltipSize,
} from "../components/tooltip/Tooltip.types";

export const tooltipWrapperClass = "tooltip-wrapper";
export const tooltipBaseClass = "tooltip";
export const tooltipShowClass = "tooltip-show";
export const tooltipArrowClass = "tooltip-arrow";
export const tooltipNoArrowClass = "tooltip-no-arrow";

export const tooltipPlacementClasses: Record<TooltipPlacement, string> = {
  top: "tooltip-top",
  bottom: "tooltip-bottom",
  left: "tooltip-left",
  right: "tooltip-right",
};

export const tooltipSizeClasses: Record<TooltipSize, string> = {
  sm: "tooltip-sm",
  md: "",
  lg: "tooltip-lg",
};

export function getTooltipClasses({
  placement = "top",
  size = "md",
  open,
  arrow = true,
  className,
}: {
  placement?: TooltipPlacement;
  size?: TooltipSize;
  open?: boolean;
  arrow?: boolean;
  className?: string;
}) {
  return cn(
    tooltipBaseClass,
    tooltipPlacementClasses[placement],
    tooltipSizeClasses[size],
    open && tooltipShowClass,
    !arrow && tooltipNoArrowClass,
    className,
  );
}
