import type {
  ComponentProps,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import type { ButtonProps } from "../button/Button.types";

export type PopconfirmPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "leftTop"
  | "leftBottom"
  | "rightTop"
  | "rightBottom";

export type PopconfirmTrigger =
  | "hover"
  | "focus"
  | "click"
  | "contextMenu"
  | "contextmenu";

export type PopconfirmAction =
  | void
  | Promise<void>
  | Promise<unknown>
  | unknown;

export interface PopconfirmProps extends Omit<
  ComponentProps<"span">,
  "children" | "title"
> {
  title?: ReactNode;
  description?: ReactNode;
  placement?: PopconfirmPlacement;
  trigger?: PopconfirmTrigger | PopconfirmTrigger[];
  icon?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  arrow?: boolean;
  destroyTooltipOnHide?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  showCancel?: boolean;
  onConfirm?: (event: MouseEvent<HTMLButtonElement>) => PopconfirmAction;
  onCancel?: (event: MouseEvent<HTMLButtonElement>) => PopconfirmAction;
  onOpenChange?: (open: boolean) => void;
  children: ReactElement;
}
