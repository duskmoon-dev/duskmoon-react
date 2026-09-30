import { cn } from "../utils";
import type { TourPlacement } from "../components/tour/Tour.types";

export const tourRootClass = "tour-root";
export const tourOpenClass = "tour-open";
export const tourMaskClass = "tour-mask";
export const tourMaskHiddenClass = "tour-mask-hidden";
export const tourTargetClass = "tour-target";
export const tourPanelClass = "tour-panel popover";
export const tourArrowClass = "tour-arrow popover-arrow";
export const tourHeaderClass = "tour-header";
export const tourTitleClass = "tour-title";
export const tourCloseClass = "tour-close";
export const tourBodyClass = "tour-body";
export const tourCoverClass = "tour-cover";
export const tourFooterClass = "tour-footer";
export const tourIndicatorsClass = "tour-indicators";
export const tourIndicatorClass = "tour-indicator";
export const tourIndicatorActiveClass = "tour-indicator-active";
export const tourActionsClass = "tour-actions";

export const tourPlacementClasses: Record<TourPlacement, string> = {
  top: "popover-top tour-top",
  bottom: "popover-bottom tour-bottom",
  left: "popover-left tour-left",
  right: "popover-right tour-right",
  topLeft: "popover-top tour-top-left",
  topRight: "popover-top tour-top-right",
  bottomLeft: "popover-bottom tour-bottom-left",
  bottomRight: "popover-bottom tour-bottom-right",
  leftTop: "popover-left tour-left-top",
  leftBottom: "popover-left tour-left-bottom",
  rightTop: "popover-right tour-right-top",
  rightBottom: "popover-right tour-right-bottom",
};

export function getTourRootClasses({
  open,
  className,
}: {
  open?: boolean;
  className?: string;
}) {
  return cn(tourRootClass, open && tourOpenClass, className);
}

export function getTourMaskClasses({
  visible,
  className,
}: {
  visible?: boolean;
  className?: string;
}) {
  return cn(tourMaskClass, !visible && tourMaskHiddenClass, className);
}

export function getTourPanelClasses({
  placement = "bottom",
  className,
}: {
  placement?: TourPlacement;
  className?: string;
}) {
  return cn(
    tourPanelClass,
    "popover-show",
    tourPlacementClasses[placement],
    className,
  );
}

export function getTourIndicatorClasses({ active }: { active?: boolean }) {
  return cn(tourIndicatorClass, active && tourIndicatorActiveClass);
}
