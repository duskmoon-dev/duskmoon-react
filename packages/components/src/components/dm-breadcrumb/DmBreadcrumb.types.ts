import type {
  ComponentProps,
  MouseEventHandler,
  ReactNode,
} from "react";
import type {
  BreadcrumbMenuProps,
  BreadcrumbProps,
} from "../breadcrumb/Breadcrumb.types";

export interface DmBreadcrumbHistoryItem {
  pathname: string;
  search?: string;
}

export interface DmBreadcrumbItem {
  title: ReactNode;
  url?: string;
  href?: string;
  value?: ReactNode;
  onClick?: (url: string) => void;
  itemRender?: (item: DmBreadcrumbItem) => ReactNode;
  menu?: BreadcrumbMenuProps;
}

export interface DmBreadcrumbProps
  extends Omit<ComponentProps<"nav">, "children" | "onClick">,
    Omit<BreadcrumbProps, "items" | "routes" | "onClick"> {
  items: DmBreadcrumbItem[];
  isStoragePath?: boolean;
  storageKey?: string;
  maxHistoryLength?: number;
  compact?: boolean;
  maxVisibleItems?: number;
  history?: DmBreadcrumbHistoryItem[];
  onClick?: MouseEventHandler<HTMLElement>;
}
