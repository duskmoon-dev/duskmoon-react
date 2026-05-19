import { cn } from "../../utils";
import type { ButtonVariant, ButtonSize } from "./Button.types";
import {
  buttonBaseClass,
  buttonVariantClasses,
  buttonSizeClasses,
  buttonLoadingClass,
} from "../../classes/button";

export function getButtonClasses({
  variant = "primary",
  size = "md",
  isLoading,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
}) {
  return cn(
    buttonBaseClass,
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    isLoading && buttonLoadingClass,
    className,
  );
}
