import type {
  ComponentProps,
  CSSProperties,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type SplitterLayout = "horizontal" | "vertical";
export type SplitterSize = number | string;

export interface SplitterResizeInfo {
  sizes: SplitterSize[];
}

export interface SplitterProps extends Omit<ComponentProps<"div">, "onResize"> {
  layout?: SplitterLayout;
  sizes?: SplitterSize[];
  defaultSizes?: SplitterSize[];
  onResize?: (sizes: SplitterSize[], info: SplitterResizeInfo) => void;
}

export interface SplitterPanelProps extends Omit<ComponentProps<"div">, "children"> {
  children?: ReactNode;
  defaultSize?: SplitterSize;
  size?: SplitterSize;
  min?: SplitterSize;
  max?: SplitterSize;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  resizable?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  style?: CSSProperties;
}

export type SplitterPanelComponent = ForwardRefExoticComponent<
  SplitterPanelProps & RefAttributes<HTMLDivElement>
>;

export type SplitterComponent = ForwardRefExoticComponent<
  SplitterProps & RefAttributes<HTMLDivElement>
> & {
  Panel: SplitterPanelComponent;
};
