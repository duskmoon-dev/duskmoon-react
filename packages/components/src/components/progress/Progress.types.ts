// GENERATED FILE. DO NOT EDIT.
import type { ComponentProps } from "react";

export type ProgressColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "neutral"
  | "base"
  | "info"
  | "success"
  | "warning"
  | "error";

export type ProgressSize = "sm" | "md" | "lg" | "xl";

export interface ProgressProps extends ComponentProps<"div"> {
  color?: ProgressColor;
  size?: ProgressSize;
  indeterminate?: boolean;
  percent?: number;
  showInfo?: boolean;
  format?: (percent: number) => React.ReactNode;
}
