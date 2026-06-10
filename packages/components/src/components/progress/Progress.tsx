import React, { forwardRef } from "react";
import { getProgressClasses } from "../../classes/progress";
import { cn } from "../../utils";
import type { ProgressProps } from "./Progress.types";

function clampPercent(percent: number) {
  if (Number.isNaN(percent)) return 0;
  return Math.min(100, Math.max(0, percent));
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      color = "primary",
      size = "md",
      indeterminate,
      percent = 0,
      showInfo = false,
      format = (value) => `${Math.round(value)}%`,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const safePercent = clampPercent(percent);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : safePercent}
        className={getProgressClasses({
          color,
          size,
          indeterminate,
          className: cn(showInfo && "progress-labeled", className),
        })}
        {...props}
      >
        <div
          className="progress-bar"
          style={indeterminate ? undefined : { width: `${safePercent}%` }}
        />
        {showInfo && (
          <span className="progress-label">{format(safePercent)}</span>
        )}
        {children}
      </div>
    );
  },
);

Progress.displayName = "Progress";
