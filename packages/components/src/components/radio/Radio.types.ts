import type { ChangeEvent, ComponentProps, ReactNode } from "react";

export type RadioColor =
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

export type RadioSize = "sm" | "md" | "lg";

export type RadioLabelPosition = "left" | "right";

export interface RadioProps extends Omit<
  ComponentProps<"input">,
  "children" | "className" | "size" | "type"
> {
  color?: RadioColor;
  size?: RadioSize;
  error?: boolean;
  loading?: boolean;
  labelPosition?: RadioLabelPosition;
  className?: string;
  children?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
