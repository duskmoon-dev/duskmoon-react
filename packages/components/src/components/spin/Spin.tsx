import React, { forwardRef, useEffect, useState } from "react";
import {
  getSpinClasses,
  spinBlurClass,
  spinContainerClass,
  spinDotClass,
  spinNestedLoadingClass,
  spinTipClass,
} from "../../classes/spin";
import { cn } from "../../utils";
import type { SpinComponent, SpinProps } from "./Spin.types";

let defaultIndicator: React.ReactNode;

function setDefaultIndicator(indicator?: React.ReactNode) {
  defaultIndicator = indicator;
}

function useDelayedSpinning(spinning: boolean, delay?: number) {
  const [delayedActive, setDelayedActive] = useState(false);
  const hasDelay = Boolean(delay && delay > 0);

  useEffect(() => {
    if (!hasDelay) {
      return;
    }

    if (!spinning) {
      const resetTimer = window.setTimeout(() => setDelayedActive(false), 0);
      return () => window.clearTimeout(resetTimer);
    }

    const resetTimer = window.setTimeout(() => setDelayedActive(false), 0);
    const showTimer = window.setTimeout(() => setDelayedActive(true), delay);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(showTimer);
    };
  }, [delay, hasDelay, spinning]);

  if (!hasDelay) {
    return spinning;
  }

  return spinning && delayedActive;
}

const SpinBase = forwardRef<HTMLDivElement, SpinProps>(
  (
    {
      spinning = true,
      size = "default",
      tip,
      indicator,
      delay,
      fullscreen,
      wrapperClassName,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const active = useDelayedSpinning(spinning, delay);
    const finalIndicator = indicator ?? defaultIndicator;
    const spin = (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy={active}
        className={getSpinClasses({
          spinning: active,
          size,
          fullscreen,
          className,
        })}
        {...props}
      >
        {finalIndicator ?? <span className={spinDotClass} />}
        {tip ? <div className={spinTipClass}>{tip}</div> : null}
      </div>
    );

    if (!children) {
      return spin;
    }

    return (
      <div className={cn(spinNestedLoadingClass, wrapperClassName)}>
        {active ? spin : null}
        <div className={cn(spinContainerClass, active && spinBlurClass)}>
          {children}
        </div>
      </div>
    );
  },
);

SpinBase.displayName = "Spin";

export const Spin = SpinBase as SpinComponent;
Spin.setDefaultIndicator = setDefaultIndicator;
