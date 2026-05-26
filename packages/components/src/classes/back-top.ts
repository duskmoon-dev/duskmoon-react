import { cn } from "../utils";

export const backTopBaseClass = "back-top";
export const backTopVisibleClass = "back-top-visible";

export function getBackTopClasses({
  visible,
  className,
}: {
  visible?: boolean;
  className?: string;
}) {
  return cn(backTopBaseClass, visible && backTopVisibleClass, className);
}
