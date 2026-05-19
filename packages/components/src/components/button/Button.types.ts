// GENERATED FILE. DO NOT EDIT.
import type { ComponentProps } from "react";

export type ButtonColor = "primary" | "secondary" | "tertiary" | "info" | "success" | "warning" | "error";

export type ButtonAppearance = "filled" | "outline" | "tonal" | "ghost" | "text";

export type ButtonShape = "rect" | "circle" | "square";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ComponentProps<"button"> {
  color?: ButtonColor;
  appearance?: ButtonAppearance;
  shape?: ButtonShape;
  size?: ButtonSize;
  block?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
