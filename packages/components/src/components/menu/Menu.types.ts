import type {
  ComponentProps,
  ForwardRefExoticComponent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefAttributes,
} from "react";

export type MenuKey = string | number;
export type MenuMode = "vertical" | "horizontal" | "inline";
export type MenuTheme = "light" | "dark";
export type MenuSize = "sm" | "md" | "lg";

export interface MenuItemType {
  key?: MenuKey;
  label?: ReactNode;
  title?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  children?: MenuItemType[];
  disabled?: boolean;
  danger?: boolean;
  type?: "item" | "group" | "divider";
  className?: string;
}

export interface MenuClickInfo {
  key: string;
  keyPath: string[];
  item: MenuItemType;
  selectedKeys: string[];
  domEvent: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;
}

export interface MenuProps extends Omit<
  ComponentProps<"ul">,
  "onClick" | "onSelect"
> {
  items?: MenuItemType[];
  selectedKeys?: MenuKey[];
  defaultSelectedKeys?: MenuKey[];
  openKeys?: MenuKey[];
  defaultOpenKeys?: MenuKey[];
  mode?: MenuMode;
  theme?: MenuTheme;
  size?: MenuSize;
  selectable?: boolean;
  multiple?: boolean;
  inlineCollapsed?: boolean;
  disabled?: boolean;
  onClick?: (info: MenuClickInfo) => void;
  onSelect?: (info: MenuClickInfo) => void;
  onDeselect?: (info: MenuClickInfo) => void;
  onOpenChange?: (openKeys: string[]) => void;
}

export interface MenuItemProps extends ComponentProps<"li"> {
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
  icon?: ReactNode;
  extra?: ReactNode;
}

export type MenuDividerProps = ComponentProps<"li">;

export interface MenuItemGroupProps extends Omit<
  ComponentProps<"li">,
  "title"
> {
  title?: ReactNode;
}

export interface MenuComponent extends ForwardRefExoticComponent<
  MenuProps & RefAttributes<HTMLUListElement>
> {
  Item: ForwardRefExoticComponent<MenuItemProps & RefAttributes<HTMLLIElement>>;
  Divider: ForwardRefExoticComponent<
    MenuDividerProps & RefAttributes<HTMLLIElement>
  >;
  ItemGroup: ForwardRefExoticComponent<
    MenuItemGroupProps & RefAttributes<HTMLLIElement>
  >;
}
