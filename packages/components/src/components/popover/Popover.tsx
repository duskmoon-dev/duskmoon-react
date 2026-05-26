import React, {
  forwardRef,
  useId,
  useState,
  type MouseEvent,
} from "react";
import {
  getPopoverClasses,
  popoverArrowClass,
  popoverWrapperClass,
} from "../../classes/popover";
import type { PopoverProps, PopoverTrigger } from "./Popover.types";

interface PopoverTriggerHandlers {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;
}

function getHandlersByTrigger(
  trigger: PopoverTrigger,
  open: boolean,
  setOpen: (nextOpen: boolean) => void,
): PopoverTriggerHandlers {
  if (trigger === "hover") {
    return {
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
    };
  }

  if (trigger === "click") {
    return {
      onClick: () => setOpen(!open),
    };
  }

  if (trigger === "focus") {
    return {
      onFocus: () => setOpen(true),
      onBlur: () => setOpen(false),
    };
  }

  return {
    onContextMenu: (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setOpen(!open);
    },
  };
}

export const Popover = forwardRef<HTMLSpanElement, PopoverProps>(
  (
    {
      children,
      className,
      content,
      title,
      placement = "top",
      trigger = "hover",
      open,
      defaultOpen,
      arrow = true,
      destroyTooltipOnHide,
      onOpenChange,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onContextMenu,
      onClick,
      id,
      ...props
    },
    ref,
  ) => {
    const isControlled = open !== undefined;
    const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
    const tooltipId = id ? `${id}-popover` : useId();
    const visible = isControlled ? open : internalOpen;

    function updateOpen(nextOpen: boolean) {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    }

    const triggerHandlers = getHandlersByTrigger(
      trigger,
      Boolean(visible),
      updateOpen,
    );

    function handleMouseEnter(event: MouseEvent<HTMLElement>) {
      onMouseEnter?.(event);
      triggerHandlers.onMouseEnter?.();
    }

    function handleMouseLeave(event: MouseEvent<HTMLElement>) {
      onMouseLeave?.(event);
      triggerHandlers.onMouseLeave?.();
    }

    function handleFocus(event: React.FocusEvent<HTMLElement>) {
      onFocus?.(event);
      triggerHandlers.onFocus?.();
    }

    function handleBlur(event: React.FocusEvent<HTMLElement>) {
      onBlur?.(event);
      triggerHandlers.onBlur?.();
    }

    function handleContextMenu(event: MouseEvent<HTMLElement>) {
      onContextMenu?.(event);
      if (triggerHandlers.onContextMenu) {
        triggerHandlers.onContextMenu(event);
      }
    }

    function handleClick(event: MouseEvent<HTMLElement>) {
      onClick?.(event);
      if (triggerHandlers.onClick) {
        triggerHandlers.onClick();
        event.preventDefault();
      }
    }

    const hasContent = Boolean(content || title);
    const shouldRenderContent = !destroyTooltipOnHide || visible;

    return (
      <span
        {...props}
        ref={ref}
        className={popoverWrapperClass}
        aria-describedby={hasContent && visible ? tooltipId : undefined}
        onMouseEnter={
          triggerHandlers.onMouseEnter ? handleMouseEnter : undefined
        }
        onMouseLeave={
          triggerHandlers.onMouseLeave ? handleMouseLeave : undefined
        }
        onFocus={triggerHandlers.onFocus ? handleFocus : undefined}
        onBlur={triggerHandlers.onBlur ? handleBlur : undefined}
        onContextMenu={
          triggerHandlers.onContextMenu ? handleContextMenu : undefined
        }
        onClick={triggerHandlers.onClick ? handleClick : undefined}
      >
        {children}
        {shouldRenderContent ? (
          <span
            id={tooltipId}
            role="tooltip"
            className={getPopoverClasses({
              placement,
              open: visible,
              arrow,
              className,
            })}
          >
            {title ? <strong>{title}</strong> : null}
            {content ?? null}
            {arrow ? <span className={popoverArrowClass} /> : null}
          </span>
        ) : null}
      </span>
    );
  },
);

Popover.displayName = "Popover";
