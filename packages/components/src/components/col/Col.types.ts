import type { ComponentProps, ReactNode } from "react";

export type ColSpan = number;
export type ColResponsiveValue =
  | number
  | {
      span?: number;
      offset?: number;
      order?: number;
      push?: number;
      pull?: number;
    };

export interface ColProps extends ComponentProps<"div"> {
  flex?: string | number;
  offset?: number;
  order?: number;
  pull?: number;
  push?: number;
  span?: ColSpan;
  xs?: ColResponsiveValue;
  sm?: ColResponsiveValue;
  md?: ColResponsiveValue;
  lg?: ColResponsiveValue;
  xl?: ColResponsiveValue;
  xxl?: ColResponsiveValue;
  children?: ReactNode;
}
