import type { ComponentProps, ReactNode } from "react";

export type SpinSize = "small" | "default" | "large";

export interface SpinProps extends Omit<ComponentProps<"div">, "children"> {
  spinning?: boolean;
  size?: SpinSize;
  tip?: ReactNode;
  indicator?: ReactNode;
  delay?: number;
  fullscreen?: boolean;
  wrapperClassName?: string;
  children?: ReactNode;
}

export interface SpinComponent extends React.ForwardRefExoticComponent<
  SpinProps & React.RefAttributes<HTMLDivElement>
> {
  setDefaultIndicator: (indicator?: ReactNode) => void;
}
