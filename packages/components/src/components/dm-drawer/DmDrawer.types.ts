import type { MouseEvent, ReactNode } from "react";
import type { ButtonProps } from "../button/Button.types";
import type { DrawerProps } from "../drawer/Drawer.types";

export interface DmDrawerProps extends Omit<
  DrawerProps,
  "className" | "closeIcon" | "footer" | "onClose"
> {
  className?: string;
  closeIcon?: ReactNode;
  footer?: ReactNode;
  footerText?: ReactNode;
  submitText?: ReactNode;
  submitProps?: Omit<ButtonProps, "children" | "onClick">;
  submitLoading?: boolean;
  submitDisabled?: boolean;
  footerAlign?: "left" | "center" | "right";
  onSubmit?: () => void;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}
