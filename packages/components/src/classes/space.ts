import { cn } from "../utils";
import type { SpaceDirection } from "../components/space/Space.types";

export const spaceBaseClass = "space";
export const spaceItemClass = "space-item";
export const spaceSplitClass = "space-split";
export const spaceWrapClass = "space-wrap";
export const spaceCompactClass = "space-compact";
export const spaceCompactBlockClass = "space-compact-block";

export const spaceDirectionClasses: Record<SpaceDirection, string> = {
  horizontal: "space-horizontal",
  vertical: "space-vertical",
};

export function getSpaceClasses({
  direction = "horizontal",
  wrap,
  className,
}: {
  direction?: SpaceDirection;
  wrap?: boolean;
  className?: string;
}) {
  return cn(
    spaceBaseClass,
    spaceDirectionClasses[direction],
    wrap && spaceWrapClass,
    className,
  );
}

export function getSpaceCompactClasses({
  block,
  direction = "horizontal",
  className,
}: {
  block?: boolean;
  direction?: SpaceDirection;
  className?: string;
}) {
  return cn(
    spaceCompactClass,
    `space-compact-${direction}`,
    block && spaceCompactBlockClass,
    className,
  );
}
