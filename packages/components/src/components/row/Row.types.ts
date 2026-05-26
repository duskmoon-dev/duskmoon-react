import type { ComponentProps, ReactNode } from "react";

export type RowAlign = "top" | "middle" | "bottom" | "stretch";
export type RowJustify =
  | "start"
  | "end"
  | "center"
  | "space-around"
  | "space-between"
  | "space-evenly";
export type RowGutter = number | [number, number];

export interface RowProps extends ComponentProps<"div"> {
  align?: RowAlign;
  justify?: RowJustify;
  gutter?: RowGutter;
  wrap?: boolean;
  children?: ReactNode;
}
