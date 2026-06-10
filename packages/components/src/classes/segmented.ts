import { cn } from "../utils";
import type { SegmentedSize } from "../components/segmented/Segmented.types";

export const segmentedBaseClass = "toggle-group";
export const segmentedStyleClass = "toggle-segmented";
export const segmentedFullClass = "toggle-group-full";
export const segmentedItemBaseClass = "toggle-btn";
export const segmentedItemActiveClass = "toggle-btn-active";
export const segmentedItemDisabledClass = "toggle-btn-disabled";
export const segmentedIconClass = "toggle-icon";

export const segmentedSizeClasses: Record<SegmentedSize, string> = {
  sm: "toggle-btn-sm",
  md: "",
  lg: "toggle-btn-lg",
};

export function getSegmentedClasses({
  block,
  className,
}: {
  block?: boolean;
  className?: string;
}) {
  return cn(
    segmentedBaseClass,
    segmentedStyleClass,
    block && segmentedFullClass,
    className,
  );
}

export function getSegmentedItemClasses({
  size = "md",
  active,
  disabled,
  className,
}: {
  size?: SegmentedSize;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    segmentedItemBaseClass,
    segmentedSizeClasses[size],
    active && segmentedItemActiveClass,
    disabled && segmentedItemDisabledClass,
    className,
  );
}
