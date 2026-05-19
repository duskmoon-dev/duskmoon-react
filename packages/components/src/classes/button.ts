import type {
  ButtonColor,
  ButtonAppearance,
  ButtonShape,
  ButtonSize,
} from "../components/button/Button.types";

export const buttonBaseClass = "btn";

export const buttonColorClasses: Record<ButtonColor, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  tertiary: "btn-tertiary",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
  error: "btn-error",
};

export const buttonAppearanceClasses: Record<ButtonAppearance, string> = {
  filled: "", // usually just btn-primary
  outline: "btn-outline",
  tonal: "btn-tonal",
  ghost: "btn-ghost",
  text: "btn-text",
};

export const buttonShapeClasses: Record<ButtonShape, string> = {
  rect: "", // default
  circle: "btn-circle",
  square: "btn-square",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export const buttonBlockClass = "btn-block";
export const buttonLoadingClass = "btn-loading";
