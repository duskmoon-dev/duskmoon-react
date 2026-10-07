import type { ComponentProps, ReactNode } from "react";

type SwapContent = {
  on: ReactNode;
  off: ReactNode;
  rotate?: boolean;
  className?: string;
};

export interface SwapProps
  extends
    SwapContent,
    Omit<ComponentProps<"input">, "children" | "className" | "type"> {
  "aria-label": string;
}

export interface SwapButtonProps
  extends
    SwapContent,
    Omit<ComponentProps<"button">, "children" | "className" | "aria-pressed"> {
  "aria-label": string;
  pressed: boolean;
}
