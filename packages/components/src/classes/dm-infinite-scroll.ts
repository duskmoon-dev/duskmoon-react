import { cn } from "../utils";

export const dmInfiniteScrollBaseClass = "dm-infinite-scroll";
export const dmInfiniteScrollContentClass = "dm-infinite-scroll-content";
export const dmInfiniteScrollLoaderClass = "dm-infinite-scroll-loader";
export const dmInfiniteScrollEndClass = "dm-infinite-scroll-end";
export const dmInfiniteScrollInverseClass = "dm-infinite-scroll-inverse";

export function getDmInfiniteScrollClasses({
  inverse,
  className,
}: {
  inverse?: boolean;
  className?: string;
}) {
  return cn(
    dmInfiniteScrollBaseClass,
    inverse && dmInfiniteScrollInverseClass,
    className,
  );
}

