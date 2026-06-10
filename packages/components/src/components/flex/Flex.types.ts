import type { ComponentProps, ElementType } from "react";

export type FlexJustify =
  | "normal"
  | "start"
  | "end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type FlexAlign =
  | "normal"
  | "start"
  | "end"
  | "center"
  | "baseline"
  | "stretch";

export type FlexGap = "small" | "middle" | "large" | number;

export interface FlexProps extends Omit<ComponentProps<"div">, "ref"> {
  component?: ElementType;
  vertical?: boolean;
  wrap?: boolean | React.CSSProperties["flexWrap"];
  justify?: FlexJustify;
  align?: FlexAlign;
  gap?: FlexGap | [FlexGap, FlexGap];
  flex?: React.CSSProperties["flex"];
}
