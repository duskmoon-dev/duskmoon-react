import type {
  DescriptionsLayout,
  DescriptionsSize,
} from "../components/descriptions/Descriptions.types";
import { cn } from "../utils";

export const descriptionsBaseClass = "descriptions";
export const descriptionsBorderedClass = "descriptions-bordered";
export const descriptionsHeaderClass = "descriptions-header";
export const descriptionsTitleClass = "descriptions-title";
export const descriptionsExtraClass = "descriptions-extra";
export const descriptionsBodyClass = "descriptions-body";
export const descriptionsItemClass = "descriptions-item";
export const descriptionsItemLabelClass = "descriptions-item-label";
export const descriptionsItemContentClass = "descriptions-item-content";

export const descriptionsSizeClasses: Record<DescriptionsSize, string> = {
  small: "descriptions-sm",
  middle: "descriptions-md",
  default: "descriptions-lg",
  sm: "descriptions-sm",
  md: "descriptions-md",
  lg: "descriptions-lg",
};

export const descriptionsLayoutClasses: Record<DescriptionsLayout, string> = {
  horizontal: "descriptions-horizontal",
  vertical: "descriptions-vertical",
};

export function getDescriptionsClasses({
  bordered,
  size = "default",
  layout = "horizontal",
  className,
}: {
  bordered?: boolean;
  size?: DescriptionsSize;
  layout?: DescriptionsLayout;
  className?: string;
}) {
  return cn(
    descriptionsBaseClass,
    bordered && descriptionsBorderedClass,
    descriptionsSizeClasses[size],
    descriptionsLayoutClasses[layout],
    className,
  );
}
