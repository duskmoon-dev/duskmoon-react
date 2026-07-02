// GENERATED FILE. DO NOT EDIT.
import { cn } from "../utils";
import type {
  BadgeColor,
  BadgeAppearance,
  BadgeSize,
} from "../components/badge/Badge.types";

export const badgeBaseClass = "badge";

export const badgeColorClasses: Record<BadgeColor, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  tertiary: "badge-tertiary",
  accent: "badge-accent",
  neutral: "badge-neutral",
  base: "badge-base",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
};

export const badgeAppearanceClasses: Record<BadgeAppearance, string> = {
  filled: "",
  outline: "badge-outline",
  tonal: "badge-tonal",
  ghost: "badge-ghost",
};

export const badgeSizeClasses: Record<BadgeSize, string> = {
  sm: "badge-sm",
  md: "badge-md",
  lg: "badge-lg",
};

export function getBadgeClasses({
  color = "primary",
  appearance = "filled",
  size = "md",
  className,
}: {
  color?: BadgeColor;
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  className?: string;
}) {
  return cn(
    badgeBaseClass,
    badgeColorClasses[color],
    badgeAppearanceClasses[appearance],
    badgeSizeClasses[size],
    className,
  );
}
