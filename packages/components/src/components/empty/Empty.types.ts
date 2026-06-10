import type { ComponentProps, ReactNode } from "react";

export interface EmptyProps extends Omit<
  ComponentProps<"div">,
  "children" | "title"
> {
  image?: ReactNode;
  imageStyle?: React.CSSProperties;
  description?: ReactNode | false;
  children?: ReactNode;
}

export interface EmptyComponent extends React.ForwardRefExoticComponent<
  EmptyProps & React.RefAttributes<HTMLDivElement>
> {
  PRESENTED_IMAGE_DEFAULT: ReactNode;
  PRESENTED_IMAGE_SIMPLE: ReactNode;
}
