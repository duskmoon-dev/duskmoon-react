import type {
  ComponentProps,
  CSSProperties,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type DescriptionsSize =
  | "small"
  | "middle"
  | "default"
  | "sm"
  | "md"
  | "lg";

export type DescriptionsLayout = "horizontal" | "vertical";
export type DescriptionsBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type DescriptionsResponsiveValue = Partial<
  Record<DescriptionsBreakpoint, number>
>;
export type DescriptionsColumn = number | DescriptionsResponsiveValue;
export type DescriptionsSpan = number | DescriptionsResponsiveValue | "filled";

export interface DescriptionsItemType {
  key?: string | number;
  label?: ReactNode;
  children?: ReactNode;
  span?: DescriptionsSpan;
  className?: string;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
}

export interface DescriptionsProps extends Omit<
  ComponentProps<"div">,
  "children" | "title"
> {
  title?: ReactNode;
  extra?: ReactNode;
  items?: DescriptionsItemType[];
  children?: ReactNode;
  bordered?: boolean;
  size?: DescriptionsSize;
  column?: DescriptionsColumn;
  layout?: DescriptionsLayout;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
}

export interface DescriptionsItemProps
  extends Omit<ComponentProps<"div">, "children"> {
  label?: ReactNode;
  children?: ReactNode;
  span?: DescriptionsSpan;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
}

export type DescriptionsItemComponent = ForwardRefExoticComponent<
  DescriptionsItemProps & RefAttributes<HTMLDivElement>
>;

export type DescriptionsComponent = ForwardRefExoticComponent<
  DescriptionsProps & RefAttributes<HTMLDivElement>
> & {
  Item: DescriptionsItemComponent;
};
