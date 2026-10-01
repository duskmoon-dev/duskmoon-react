import { forwardRef } from "react";
import {
  getSwapClasses,
  getSwapInputClasses,
  swapOffClass,
  swapOnClass,
} from "../../classes/swap";
import type { SwapProps } from "./Swap.types";

export const Swap = forwardRef<HTMLInputElement, SwapProps>(
  (
    {
      checked,
      defaultChecked,
      onChange,
      disabled,
      off,
      on,
      rotate = false,
      wrapperClassName,
      className,
      ...inputProps
    },
    ref,
  ) => (
    <label className={getSwapClasses({ rotate, wrapperClassName })}>
      <input
        {...inputProps}
        ref={ref}
        type="checkbox"
        className={getSwapInputClasses({ className })}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={swapOffClass} aria-hidden="true">
        {off}
      </span>
      <span className={swapOnClass} aria-hidden="true">
        {on}
      </span>
    </label>
  ),
);

Swap.displayName = "Swap";
