import type {
  ComponentProps,
  CSSProperties,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type LayoutBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export interface LayoutProps extends Omit<ComponentProps<"div">, "ref"> {
  hasSider?: boolean;
}

export type LayoutSectionProps = Omit<ComponentProps<"div">, "ref">;

export type CollapseType = "clickTrigger" | "responsive";

export interface LayoutSiderProps extends LayoutSectionProps {
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapse?: (collapsed: boolean, type: CollapseType) => void;
  width?: CSSProperties["width"];
  collapsedWidth?: CSSProperties["width"];
  trigger?: ReactNode;
  breakpoint?: LayoutBreakpoint;
}

export interface LayoutComponent
  extends ForwardRefExoticComponent<
    LayoutProps & RefAttributes<HTMLDivElement>
  > {
  Header: ForwardRefExoticComponent<
    LayoutSectionProps & RefAttributes<HTMLDivElement>
  >;
  Sider: ForwardRefExoticComponent<
    LayoutSiderProps & RefAttributes<HTMLDivElement>
  >;
  Content: ForwardRefExoticComponent<
    LayoutSectionProps & RefAttributes<HTMLDivElement>
  >;
  Footer: ForwardRefExoticComponent<
    LayoutSectionProps & RefAttributes<HTMLDivElement>
  >;
}
