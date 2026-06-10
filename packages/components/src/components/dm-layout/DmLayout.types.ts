import type { ComponentProps, ReactNode } from "react";
import type { LayoutProps } from "../layout/Layout.types";
import type { DmBreadcrumbItem } from "../dm-breadcrumb/DmBreadcrumb.types";
import type { DmMenuProps, DmMenuSchema } from "../dm-menu/DmMenu.types";

export interface DmLayoutProps
  extends Omit<ComponentProps<"div">, "onSelect">,
    Omit<LayoutProps, "children"> {
  menus?: DmMenuSchema[];
  selectedKey?: string;
  openAllKeys?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  hideProductHeader?: boolean;
  productIcon?: ReactNode;
  productTitle?: ReactNode;
  breadcrumbItems?: DmBreadcrumbItem[];
  aheadBreadcrumbItems?: DmBreadcrumbItem[];
  behindBreadcrumbItems?: DmBreadcrumbItem[];
  tips?: ReactNode;
  locale?: string;
  menuProps?: Omit<
    DmMenuProps,
    | "menus"
    | "selectedKeys"
    | "openKeys"
    | "inlineCollapsed"
    | "onCollapsed"
    | "onClick"
  >;
  onCollapse?: (collapsed: boolean) => void;
  onMenuClick?: (key: string, menu?: DmMenuSchema) => void;
  onBreadcrumbClick?: (url: string) => void;
  children?: ReactNode;
}

export interface DmLayoutSelection {
  selectedMenuKey: string;
  selectedBreadcrumbKey: string;
  openKeys: string[];
  breadcrumbItems: DmBreadcrumbItem[];
  tips?: ReactNode;
}

