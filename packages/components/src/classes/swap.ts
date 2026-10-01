import { cn } from "../utils";

export const swapBaseClass = "swap";
export const swapInputClass = "swap-input";
export const swapOffClass = "swap-off";
export const swapOnClass = "swap-on";
export const swapRotateClass = "swap-rotate";

export function getSwapClasses({
  rotate = false,
  wrapperClassName,
}: {
  rotate?: boolean;
  wrapperClassName?: string;
}) {
  return cn(swapBaseClass, rotate && swapRotateClass, wrapperClassName);
}

export function getSwapInputClasses({ className }: { className?: string }) {
  return cn(swapInputClass, className);
}
