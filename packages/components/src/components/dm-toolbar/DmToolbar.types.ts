import type { CSSProperties, ReactNode } from "react";
import type { ButtonProps } from "../button/Button.types";
import type { DropdownMenu } from "../dropdown/Dropdown.types";

export type DmToolbarItemType = "primary" | "default";

export interface DmToolbarItem extends Omit<
  ButtonProps,
  "children" | "type" | "title"
> {
  key?: string | number;
  title: ReactNode;
  type?: DmToolbarItemType;
  htmlType?: ButtonProps["type"];
  menu?: DropdownMenu;
}

export interface DmToolbarProps {
  items?: DmToolbarItem[];
  className?: string;
  style?: CSSProperties;
  moreText?: ReactNode;
  maxVisibleSecondaryItems?: number;
}
