import { cn } from "../utils";
import type { RateColor, RateSize } from "../components/rate/Rate.types";

export const rateBaseClass = "rating";
export const rateItemBaseClass = "rating-item";
export const rateItemFilledClass = "rating-item-filled";
export const rateItemHalfClass = "rating-item-half";
export const rateDisabledClass = "rating-disabled";
export const rateReadOnlyClass = "rating-readonly";
export const rateInteractiveClass = "rating-interactive";

export const rateSizeClasses: Record<RateSize, string> = {
  sm: "rating-sm",
  md: "",
  lg: "rating-lg",
  xl: "rating-xl",
};

export const rateColorClasses: Record<RateColor, string> = {
  primary: "",
  secondary: "rating-secondary",
  tertiary: "rating-tertiary",
  warning: "rating-warning",
};

export function getRateClasses({
  size = "md",
  color = "primary",
  disabled,
  readOnly,
  interactive,
  className,
}: {
  size?: RateSize;
  color?: RateColor;
  disabled?: boolean;
  readOnly?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  return cn(
    rateBaseClass,
    rateSizeClasses[size],
    rateColorClasses[color],
    disabled && rateDisabledClass,
    readOnly && rateReadOnlyClass,
    interactive && rateInteractiveClass,
    className,
  );
}

export function getRateItemClasses({
  filled,
  half,
  className,
}: {
  filled?: boolean;
  half?: boolean;
  className?: string;
}) {
  return cn(
    rateItemBaseClass,
    filled && rateItemFilledClass,
    half && rateItemHalfClass,
    className,
  );
}
