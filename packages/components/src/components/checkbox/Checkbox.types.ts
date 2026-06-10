import type { ChangeEvent, ComponentProps, ReactNode } from "react";

export type CheckboxColor = "primary" | "secondary" | "tertiary";

export type CheckboxSize = "sm" | "md" | "lg";

export type CheckboxLabelPosition = "left" | "right";

export interface CheckboxProps extends Omit<
  ComponentProps<"input">,
  "children" | "className" | "size" | "type"
> {
  color?: CheckboxColor;
  size?: CheckboxSize;
  indeterminate?: boolean;
  error?: boolean;
  loading?: boolean;
  labelPosition?: CheckboxLabelPosition;
  className?: string;
  children?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
