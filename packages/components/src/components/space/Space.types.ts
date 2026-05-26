import type { ComponentProps, ReactNode } from "react";

export type SpaceSize = "small" | "middle" | "large" | number;

export type SpaceDirection = "horizontal" | "vertical";

export type SpaceAlign = "start" | "end" | "center" | "baseline";

export interface SpaceProps extends ComponentProps<"div"> {
  size?: SpaceSize | [SpaceSize, SpaceSize];
  direction?: SpaceDirection;
  align?: SpaceAlign;
  split?: ReactNode;
  wrap?: boolean;
}

export interface SpaceCompactProps extends ComponentProps<"div"> {
  block?: boolean;
  direction?: SpaceDirection;
  size?: SpaceSize;
}

export interface SpaceComponent extends React.ForwardRefExoticComponent<
  SpaceProps & React.RefAttributes<HTMLDivElement>
> {
  Compact: React.ForwardRefExoticComponent<
    SpaceCompactProps & React.RefAttributes<HTMLDivElement>
  >;
}
