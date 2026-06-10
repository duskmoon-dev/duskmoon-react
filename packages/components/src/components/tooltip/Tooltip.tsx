import React, { forwardRef, useState } from "react";
import {
  getTooltipClasses,
  tooltipArrowClass,
  tooltipWrapperClass,
} from "../../classes/tooltip";
import type { TooltipProps } from "./Tooltip.types";

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      title,
      placement = "top",
      open,
      defaultOpen,
      arrow = true,
      size = "md",
      className,
      children,
      onBlur,
      onFocus,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
    const isControlled = open !== undefined;
    const visible = isControlled ? open : internalOpen;
    const tooltipId =
      props.id !== undefined ? `${props.id}-tooltip` : undefined;

    function showTooltip(event: React.MouseEvent<HTMLSpanElement>) {
      onMouseEnter?.(event);
      if (!isControlled) setInternalOpen(true);
    }

    function hideTooltip(event: React.MouseEvent<HTMLSpanElement>) {
      onMouseLeave?.(event);
      if (!isControlled) setInternalOpen(false);
    }

    function focusTooltip(event: React.FocusEvent<HTMLSpanElement>) {
      onFocus?.(event);
      if (!isControlled) setInternalOpen(true);
    }

    function blurTooltip(event: React.FocusEvent<HTMLSpanElement>) {
      onBlur?.(event);
      if (!isControlled) setInternalOpen(false);
    }

    return (
      <span
        {...props}
        ref={ref}
        className={tooltipWrapperClass}
        aria-describedby={visible && title ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={focusTooltip}
        onBlur={blurTooltip}
      >
        {children}
        {title ? (
          <span
            id={tooltipId}
            role="tooltip"
            className={getTooltipClasses({
              placement,
              size,
              open: visible,
              arrow,
              className,
            })}
          >
            {title}
            {arrow ? <span className={tooltipArrowClass} /> : null}
          </span>
        ) : null}
      </span>
    );
  },
);

Tooltip.displayName = "Tooltip";
