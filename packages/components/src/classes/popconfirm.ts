import { cn } from "../utils";
import type { PopconfirmPlacement } from "../components/popconfirm/Popconfirm.types";

export const popconfirmWrapperClass = "popover-wrapper popconfirm-wrapper";
export const popconfirmBaseClass = "popover popconfirm";
export const popconfirmOpenClass = "popover-show popconfirm-open";
export const popconfirmArrowClass = "popover-arrow popconfirm-arrow";
export const popconfirmNoArrowClass = "popover-no-arrow popconfirm-no-arrow";
export const popconfirmBodyClass = "popconfirm-body";
export const popconfirmIconClass = "popconfirm-icon";
export const popconfirmContentClass = "popconfirm-content";
export const popconfirmTitleClass = "popconfirm-title";
export const popconfirmDescriptionClass = "popconfirm-description";
export const popconfirmActionsClass = "popconfirm-actions";

export const popconfirmPlacementClasses: Record<PopconfirmPlacement, string> = {
  top: "popover-top popconfirm-top",
  bottom: "popover-bottom popconfirm-bottom",
  left: "popover-left popconfirm-left",
  right: "popover-right popconfirm-right",
  topLeft: "popover-top popconfirm-top-left",
  topRight: "popover-top popconfirm-top-right",
  bottomLeft: "popover-bottom popconfirm-bottom-left",
  bottomRight: "popover-bottom popconfirm-bottom-right",
  leftTop: "popover-left popconfirm-left-top",
  leftBottom: "popover-left popconfirm-left-bottom",
  rightTop: "popover-right popconfirm-right-top",
  rightBottom: "popover-right popconfirm-right-bottom",
};

export function getPopconfirmClasses({
  placement = "top",
  open,
  arrow = true,
  className,
}: {
  placement?: PopconfirmPlacement;
  open?: boolean;
  arrow?: boolean;
  className?: string;
}) {
  return cn(
    popconfirmBaseClass,
    popconfirmPlacementClasses[placement],
    open && popconfirmOpenClass,
    !arrow && popconfirmNoArrowClass,
    className,
  );
}
