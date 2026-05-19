import type { ButtonVariant, ButtonSize } from "../components/button/Button.types";

export const buttonBaseClass = "btn";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  text: "btn-text",
  error: "btn-error",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export const buttonLoadingClass = "btn-loading";
