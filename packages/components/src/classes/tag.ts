import { cn } from "../utils";
import type { TagColor } from "../components/tag/Tag.types";

export const tagBaseClass = "chip";
export const tagIconClass = "chip-icon";
export const tagCloseClass = "chip-remove";
export const tagCheckableClass = "chip-selectable";
export const tagCheckedClass = "chip-selected";
export const tagDisabledClass = "chip-disabled";
export const tagBorderlessClass = "chip-borderless";
export const tagCustomColorClass = "chip-custom-color";

export const tagColorClasses: Record<TagColor, string> = {
  primary: "chip-primary",
  secondary: "chip-secondary",
  tertiary: "chip-tertiary",
  success: "chip-success",
  error: "chip-error",
  warning: "chip-warning",
  info: "chip-info",
};

export function getTagClasses({
  color,
  bordered = true,
  className,
}: {
  color?: string;
  bordered?: boolean;
  className?: string;
}) {
  const colorClass = color
    ? (tagColorClasses[color as TagColor] ?? tagCustomColorClass)
    : undefined;

  return cn(
    tagBaseClass,
    bordered && "chip-outlined",
    colorClass,
    !bordered && tagBorderlessClass,
    className,
  );
}

export function getCheckableTagClasses({
  checked,
  disabled,
  className,
}: {
  checked?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    tagBaseClass,
    tagCheckableClass,
    checked && tagCheckedClass,
    disabled && tagDisabledClass,
    className,
  );
}
