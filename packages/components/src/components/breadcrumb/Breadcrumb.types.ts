import type {
  ComponentProps,
  ForwardRefExoticComponent,
  Key,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  RefAttributes,
} from "react";

export type BreadcrumbParams = Record<string, string | number | undefined>;

export interface BreadcrumbMenuClickInfo {
  key: Key;
  item: BreadcrumbMenuItemType;
  domEvent: MouseEvent<HTMLElement>;
}

export interface BreadcrumbMenuItemType {
  key?: Key;
  label?: ReactNode;
  title?: ReactNode;
  href?: string;
  path?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  children?: BreadcrumbMenuItemType[];
}

export interface BreadcrumbMenuProps {
  items?: BreadcrumbMenuItemType[];
  onClick?: (info: BreadcrumbMenuClickInfo) => void;
  selectedKeys?: Key[];
}

export interface BreadcrumbRoute extends Omit<
  ComponentProps<"span">,
  "children" | "title" | "onClick"
> {
  key?: Key;
  title?: ReactNode;
  label?: ReactNode;
  breadcrumbName?: ReactNode;
  path?: string;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
  menu?: BreadcrumbMenuProps;
  onClick?: MouseEventHandler<HTMLElement>;
  children?: BreadcrumbRoute[];
}

export interface BreadcrumbSeparatorType {
  type: "separator";
  key?: Key;
  separator?: ReactNode;
  className?: string;
}

export type BreadcrumbItemType = BreadcrumbRoute | BreadcrumbSeparatorType;

export type BreadcrumbItemRender = (
  route: BreadcrumbRoute,
  params: BreadcrumbParams,
  routes: BreadcrumbRoute[],
  paths: string[],
) => ReactNode;

export interface BreadcrumbProps extends Omit<
  ComponentProps<"nav">,
  "children"
> {
  items?: BreadcrumbItemType[];
  routes?: BreadcrumbRoute[];
  params?: BreadcrumbParams;
  separator?: ReactNode;
  itemRender?: BreadcrumbItemRender;
  children?: ReactNode;
}

export type BreadcrumbComponent = ForwardRefExoticComponent<
  BreadcrumbProps & RefAttributes<HTMLElement>
>;
