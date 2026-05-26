import { cn } from "../utils";
import type {
  MenuMode,
  MenuSize,
  MenuTheme,
} from "../components/menu/Menu.types";

export const menuBaseClass = "menu";
export const menuShowClass = "menu-show";
export const menuItemClass = "menu-item";
export const menuItemActiveClass = "menu-item-active";
export const menuItemDisabledClass = "menu-item-disabled";
export const menuItemIconClass = "menu-item-icon";
export const menuItemTrailingClass = "menu-item-trailing";
export const menuItemSubmenuClass = "menu-item-submenu";
export const menuDividerClass = "menu-divider";
export const menuLabelClass = "menu-label";
export const menuSubmenuClass = "menu-submenu";
export const menuCompactClass = "menu-compact";
export const menuWideClass = "menu-wide";
export const menuDenseClass = "menu-dense";

export const menuModeClasses: Record<MenuMode, string> = {
  vertical: "menu-vertical",
  horizontal: "menu-horizontal",
  inline: "menu-inline",
};

export const menuThemeClasses: Record<MenuTheme, string> = {
  light: "",
  dark: "menu-dark menu-surface-container-highest",
};

export const menuSizeClasses: Record<MenuSize, string> = {
  sm: menuCompactClass,
  md: "",
  lg: menuWideClass,
};

export function getMenuClasses({
  mode = "vertical",
  theme = "light",
  size = "md",
  inlineCollapsed,
  disabled,
  className,
}: {
  mode?: MenuMode;
  theme?: MenuTheme;
  size?: MenuSize;
  inlineCollapsed?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    menuBaseClass,
    menuShowClass,
    menuModeClasses[mode],
    menuThemeClasses[theme],
    menuSizeClasses[size],
    inlineCollapsed && "menu-inline-collapsed",
    disabled && menuItemDisabledClass,
    className,
  );
}

export function getMenuItemClasses({
  active,
  disabled,
  danger,
  submenu,
  className,
}: {
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  submenu?: boolean;
  className?: string;
}) {
  return cn(
    menuItemClass,
    active && menuItemActiveClass,
    disabled && menuItemDisabledClass,
    danger && "menu-item-danger",
    submenu && menuItemSubmenuClass,
    className,
  );
}
