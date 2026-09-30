import type { ChangeEvent, ComponentProps, ReactNode } from "react";

export type SwitchSize = "sm" | "md" | "lg";

export type SwitchColor =
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

export type SwitchChangeEvent = ChangeEvent<HTMLInputElement>;

export interface SwitchProps extends Omit<
  ComponentProps<"input">,
  | "checked"
  | "children"
  | "className"
  | "color"
  | "defaultChecked"
  | "onChange"
  | "size"
  | "type"
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: SwitchChangeEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: SwitchSize;
  color?: SwitchColor;
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;
  className?: string;
}
