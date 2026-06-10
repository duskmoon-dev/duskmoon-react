import type {
  ComponentProps,
  ForwardRefExoticComponent,
  MouseEvent,
  ReactNode,
  RefAttributes,
} from "react";
import type { ButtonProps } from "../button/Button.types";

export type DropdownPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

export type DropdownTrigger = "click" | "hover" | "contextMenu";

export interface DropdownMenuItem {
  key: string | number;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  type?: "item" | "divider";
  className?: string;
}

export interface DropdownMenuInfo {
  key: string;
  item: DropdownMenuItem;
  domEvent: MouseEvent<HTMLButtonElement>;
}

export interface DropdownMenu {
  items?: DropdownMenuItem[];
  onClick?: (info: DropdownMenuInfo) => void;
}

export interface DropdownProps extends Omit<ComponentProps<"span">, "menu"> {
  menu?: DropdownMenu;
  overlay?: ReactNode;
  dropdownRender?: (menus: ReactNode) => ReactNode;
  trigger?: DropdownTrigger[];
  placement?: DropdownPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  arrow?: boolean;
  disabled?: boolean;
  destroyPopupOnHide?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export type DropdownButtonProps = Omit<
  DropdownProps,
  "children" | "onClick" | keyof ButtonProps
> &
  Omit<ButtonProps, "children" | "onClick"> & {
  buttonsRender?: (buttons: ReactNode[]) => ReactNode[];
  children?: ReactNode;
  onClick?: ButtonProps["onClick"];
};

export type DropdownComponent = ForwardRefExoticComponent<
  DropdownProps & RefAttributes<HTMLSpanElement>
> & {
  Button: ForwardRefExoticComponent<
    DropdownButtonProps & RefAttributes<HTMLSpanElement>
  >;
};
