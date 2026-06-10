import type { Key, ReactNode } from "react";
import type { MenuClickInfo, MenuProps } from "../menu/Menu.types";

export interface DmMenuPageElement {
  eleId?: number;
  eleCode?: string;
  operationName?: string;
  apiUrl?: string;
  operationType?: string;
  description?: string;
  sensitiveOperationProtection?: boolean;
}

export interface DmMenuSchema {
  menuId?: number | string;
  parentId?: number | string;
  productId?: number | string;
  menuName: string;
  menuNameEn?: string;
  menuType?: number | string;
  subRouter?: boolean;
  menuUrl: string;
  menuNum?: number;
  enable?: boolean;
  children?: DmMenuSchema[];
  menuIdentifier?: string;
  iconStr?: ReactNode;
  tipsEnabled?: boolean;
  tips?: ReactNode;
  tipsEn?: ReactNode;
  pageElements?: DmMenuPageElement[];
}

export interface DmMenuClickInfo extends MenuClickInfo {
  menu?: DmMenuSchema;
}

export interface DmMenuProps
  extends Omit<MenuProps, "items" | "children" | "onClick" | "ref"> {
  menus?: DmMenuSchema[];
  items?: MenuProps["items"];
  hideProductHeader?: boolean;
  productIcon?: ReactNode;
  productTitle?: ReactNode;
  locale?: string;
  onCollapsed?: () => void;
  onClick?: (info: DmMenuClickInfo) => void;
}

export type DmMenuKey = Key;
