import type {
  ComponentProps,
  CSSProperties,
  ForwardRefExoticComponent,
  MouseEvent,
  ReactNode,
  RefAttributes,
} from "react";

export type DrawerPlacement = "left" | "right" | "top" | "bottom";

export type DrawerSize = "sm" | "md" | "lg" | "xl";

export interface DrawerProps extends Omit<
  ComponentProps<"aside">,
  "children" | "className" | "title"
> {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  placement?: DrawerPlacement;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  closeIcon?: ReactNode;
  footer?: ReactNode;
  extra?: ReactNode;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  size?: DrawerSize;
  className?: string;
}

export type DrawerComponent = ForwardRefExoticComponent<
  DrawerProps & RefAttributes<HTMLElement>
>;
