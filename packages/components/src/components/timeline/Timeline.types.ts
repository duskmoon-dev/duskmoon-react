import type { ComponentProps, ReactNode } from "react";

export type TimelineMode = "left" | "right" | "alternate";

export type TimelineColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "neutral"
  | "base"
  | "info"
  | "success"
  | "warning"
  | "error";

export type TimelineSize = "sm" | "md" | "lg";

export interface TimelineItem {
  children?: ReactNode;
  label?: ReactNode;
  color?: TimelineColor;
  dot?: ReactNode;
  pending?: boolean;
  className?: string;
}

export interface TimelineProps extends Omit<ComponentProps<"div">, "children"> {
  items?: TimelineItem[];
  children?: ReactNode;
  mode?: TimelineMode;
  pending?: ReactNode | boolean;
  reverse?: boolean;
  size?: TimelineSize;
}
