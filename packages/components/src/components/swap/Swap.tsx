import { forwardRef } from "react";
import { cn } from "../../utils";
import type { SwapButtonProps, SwapProps } from "./Swap.types";

export const Swap = forwardRef<HTMLInputElement, SwapProps>(
  ({ on, off, rotate, className, ...inputProps }, ref) => (
    <label className={cn("swap", rotate && "swap-rotate", className)}>
      <input {...inputProps} ref={ref} type="checkbox" className="swap-input" />
      <span className="swap-off" aria-hidden="true">
        {off}
      </span>
      <span className="swap-on" aria-hidden="true">
        {on}
      </span>
    </label>
  ),
);

Swap.displayName = "Swap";

export const SwapButton = forwardRef<HTMLButtonElement, SwapButtonProps>(
  (
    { on, off, rotate, className, pressed, type = "button", ...buttonProps },
    ref,
  ) => (
    <button
      {...buttonProps}
      ref={ref}
      type={type}
      aria-pressed={pressed}
      className={cn("swap", rotate && "swap-rotate", className)}
    >
      <span className="swap-off" aria-hidden="true">
        {off}
      </span>
      <span className="swap-on" aria-hidden="true">
        {on}
      </span>
    </button>
  ),
);

SwapButton.displayName = "SwapButton";
