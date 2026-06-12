import type { ComponentPropsWithoutRef, ReactNode, UIEvent } from "react";

export type DmScrollThreshold = number | `${number}px` | string;

export interface DmInfiniteScrollProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onScroll"
> {
  id: string;
  prefix?: string;
  children?: ReactNode;
  dataLength: number;
  next: () => void | Promise<void>;
  hasMore: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
  scrollThreshold?: DmScrollThreshold;
  height?: number | string;
  hasChildren?: boolean;
  inverse?: boolean;
  initialScrollY?: number;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
}
