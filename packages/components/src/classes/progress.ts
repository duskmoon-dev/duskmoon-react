// GENERATED FILE. DO NOT EDIT.
import { cn } from "../utils";
import type {
  ProgressColor,
  ProgressSize,
} from "../components/progress/Progress.types";

export const progressBaseClass = "progress";

export const progressColorClasses: Record<ProgressColor, string> = {
  primary: "progress-primary",
  secondary: "progress-secondary",
  tertiary: "progress-tertiary",
  accent: "progress-accent",
  neutral: "progress-neutral",
  base: "progress-base",
  info: "progress-info",
  success: "progress-success",
  warning: "progress-warning",
  error: "progress-error",
};

export const progressSizeClasses: Record<ProgressSize, string> = {
  sm: "progress-sm",
  md: "progress-md",
  lg: "progress-lg",
  xl: "progress-xl",
};

export const progressIndeterminateClass = "progress-indeterminate";

export function getProgressClasses({
  color = "primary",
  size = "md",
  indeterminate,
  className,
}: {
  color?: ProgressColor;
  size?: ProgressSize;
  indeterminate?: boolean;
  className?: string;
}) {
  return cn(
    progressBaseClass,
    progressColorClasses[color],
    progressSizeClasses[size],
    indeterminate && progressIndeterminateClass,
    className,
  );
}
