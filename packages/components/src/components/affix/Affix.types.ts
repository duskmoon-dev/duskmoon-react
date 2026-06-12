import type { ComponentProps, ReactNode } from "react";

export interface AffixProps extends Omit<
  ComponentProps<"div">,
  "children" | "onChange"
> {
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => Window | HTMLElement | null;
  onChange?: (affixed?: boolean) => void;
  children?: ReactNode;
}
