import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { BreadcrumbProps } from "../breadcrumb/Breadcrumb.types";
import type { DmToolbarProps } from "../dm-toolbar/DmToolbar.types";

export interface DmPageHeaderTitleItem {
  title: ReactNode;
  value: ReactNode;
}

export interface DmPageHeaderProps {
  backClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onBack?: (event: MouseEvent<HTMLButtonElement>) => void;
  title?: ReactNode | DmPageHeaderTitleItem[];
  extra?: ReactNode | DmToolbarProps;
  breadcrumb?: BreadcrumbProps;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  titleSeparator?: ReactNode;
  backIcon?: ReactNode;
}
