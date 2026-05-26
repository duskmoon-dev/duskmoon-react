import { cn } from "../utils";
import type {
  SkeletonAnimation,
  SkeletonVariant,
  SkeletonWidth,
} from "../components/skeleton/Skeleton.types";

export const skeletonBaseClass = "skeleton";

export const skeletonVariantClasses: Record<SkeletonVariant, string> = {
  text: "skeleton-text",
  circle: "skeleton-circle",
  rect: "skeleton-rect",
  button: "skeleton-button",
  input: "skeleton-input",
  card: "skeleton-card",
};

export const skeletonAnimationClasses: Record<SkeletonAnimation, string> = {
  pulse: "",
  wave: "skeleton-wave",
  none: "skeleton-static",
};

export const skeletonWidthClasses: Record<SkeletonWidth, string> = {
  full: "skeleton-w-full",
  threeQuarter: "skeleton-w-3/4",
  half: "skeleton-w-1/2",
  quarter: "skeleton-w-1/4",
};

export const skeletonGroupClass = "skeleton-group";
export const skeletonAvatarTextClass = "skeleton-avatar-text";
export const skeletonRoundedClass = "skeleton-rounded";
export const skeletonRoundClass = "skeleton-rounded-full";

export function getSkeletonClasses({
  variant = "text",
  animation = "none",
  round,
  width,
  className,
}: {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  round?: boolean;
  width?: SkeletonWidth;
  className?: string;
}) {
  return cn(
    skeletonBaseClass,
    skeletonVariantClasses[variant],
    skeletonAnimationClasses[animation],
    round && skeletonRoundClass,
    width && skeletonWidthClasses[width],
    className,
  );
}
