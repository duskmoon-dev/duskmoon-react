import { cn } from "../utils";
import type {
  DrawerPlacement,
  DrawerSize,
} from "../components/drawer/Drawer.types";

export const drawerBaseClass = "drawer";
export const drawerOpenClass = "drawer-open";
export const drawerHeaderClass = "drawer-header";
export const drawerTitleClass = "drawer-title";
export const drawerBodyClass = "drawer-body";
export const drawerFooterClass = "drawer-footer";
export const drawerCloseClass = "drawer-close";

export const drawerPlacementClasses: Record<DrawerPlacement, string> = {
  left: "drawer-left",
  right: "drawer-right",
  top: "drawer-top",
  bottom: "drawer-bottom",
};

export const drawerSizeClasses: Record<DrawerSize, string> = {
  sm: "drawer-sm",
  md: "drawer-md",
  lg: "drawer-lg",
  xl: "drawer-xl",
};

export function getDrawerClasses({
  open,
  placement = "right",
  size = "md",
  className,
}: {
  open?: boolean;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  className?: string;
}) {
  return cn(
    drawerBaseClass,
    drawerPlacementClasses[placement],
    size && drawerSizeClasses[size],
    open && drawerOpenClass,
    className,
  );
}
