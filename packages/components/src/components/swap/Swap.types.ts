import type { ChangeEventHandler, ComponentProps, ReactNode } from "react";

export interface SwapProps extends Omit<
  ComponentProps<"input">,
  | "checked"
  | "children"
  | "className"
  | "defaultChecked"
  | "onChange"
  | "size"
  | "type"
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /** Decorative, noninteractive content shown while unchecked. */
  off?: ReactNode;
  /** Decorative, noninteractive content shown while checked. */
  on?: ReactNode;
  rotate?: boolean;
  /** Additional class names for the wrapping label. */
  wrapperClassName?: string;
  /** Additional class names for the native checkbox. */
  className?: string;
}
