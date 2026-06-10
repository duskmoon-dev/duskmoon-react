// GENERATED FILE. DO NOT EDIT.
import type { ComponentProps } from "react";

export type BadgeColor = "primary" | "secondary" | "info" | "success" | "warning" | "error";

export type BadgeAppearance = "filled" | "outline" | "tonal" | "ghost";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends ComponentProps<"div"> {
  color?: BadgeColor;
  appearance?: BadgeAppearance;
  size?: BadgeSize;
}
