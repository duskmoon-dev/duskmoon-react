import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import { getTooltipClasses, tooltipWrapperClass } from "../../classes/tooltip";
import type { TooltipProps } from "./Tooltip.types";

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      title,
      placement = "top",
      open,
      defaultOpen,
      onOpenChange,
      arrow = true,
      size = "md",
      className,
      children,
      style,
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
    const reactId = useId();
    const tooltipId =
      props.id !== undefined ? `${props.id}-tooltip` : `${reactId}-tooltip`;
    const anchor = `--tooltip-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const surfaceRef = useRef<HTMLSpanElement>(null);
    const hoveredRef = useRef(false);
    const focusedRef = useRef(false);
    const interactionOpenRef = useRef(false);
    const visibleRef = useRef(visible);
    const controlledRef = useRef(isControlled);
    const onOpenChangeRef = useRef(onOpenChange);
    visibleRef.current = visible;
    controlledRef.current = isControlled;
    onOpenChangeRef.current = onOpenChange;

    const hasTitle = Boolean(title);

    useEffect(() => {
      const surface = surfaceRef.current;
      if (!surface) return;

      function handleToggle(event: Event) {
        if (
          (event as ToggleEvent).newState !== "closed" ||
          !visibleRef.current ||
          isControlled ||
          isControlled !== controlledRef.current ||
          surface.matches(":popover-open")
        ) {
          return;
        }

        // A native light dismiss clears the current hover/focus intent too.
        hoveredRef.current = false;
        focusedRef.current = false;
        interactionOpenRef.current = false;
        onOpenChangeRef.current?.(false);
        setInternalOpen(false);
      }

      surface.addEventListener("toggle", handleToggle);
      return () => surface.removeEventListener("toggle", handleToggle);
    }, [hasTitle, isControlled]);

    useEffect(() => {
      const surface = surfaceRef.current;
      if (!surface) return;
      if (visible && !surface.matches(":popover-open")) {
        surface.showPopover();
      } else if (!visible && surface.matches(":popover-open")) {
        surface.hidePopover();
      }
    }, [visible, hasTitle, isControlled]);

    useEffect(() => {
      if (!isControlled || !visible || !hasTitle) return;
      const wrapper = surfaceRef.current?.parentElement;
      if (!wrapper) return;

      function requestDismiss() {
        hoveredRef.current = false;
        focusedRef.current = false;
        interactionOpenRef.current = false;
        onOpenChangeRef.current?.(false);
      }

      function handlePointerDown(event: PointerEvent) {
        if (!wrapper.contains(event.target as Node)) requestDismiss();
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") requestDismiss();
      }

      // Manual popovers keep controlled `open` authoritative; these are close requests.
      document.addEventListener("pointerdown", handlePointerDown, true);
      document.addEventListener("keydown", handleKeyDown, true);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
        document.removeEventListener("keydown", handleKeyDown, true);
      };
    }, [isControlled, visible, hasTitle]);

    function updateInteraction() {
      const next = hoveredRef.current || focusedRef.current;
      if (next === interactionOpenRef.current) return;
      interactionOpenRef.current = next;
      onOpenChange?.(next);
      if (!isControlled) setInternalOpen(next);
    }

    function showTooltip(event: React.MouseEvent<HTMLSpanElement>) {
      onMouseEnter?.(event);
      hoveredRef.current = true;
      updateInteraction();
    }

    function hideTooltip(event: React.MouseEvent<HTMLSpanElement>) {
      onMouseLeave?.(event);
      hoveredRef.current = false;
      updateInteraction();
    }

    function focusTooltip(event: React.FocusEvent<HTMLSpanElement>) {
      onFocus?.(event);
      focusedRef.current = true;
      updateInteraction();
    }

    function blurTooltip(event: React.FocusEvent<HTMLSpanElement>) {
      onBlur?.(event);
      if (event.currentTarget.contains(event.relatedTarget)) return;
      focusedRef.current = false;
      updateInteraction();
    }

    let trigger = children;
    if (
      hasTitle &&
      React.isValidElement<{ "aria-describedby"?: string }>(children) &&
      children.type !== React.Fragment
    ) {
      trigger = React.cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], tooltipId]
          .filter(Boolean)
          .join(" "),
      });
    }

    return (
      <span
        {...props}
        ref={ref}
        className={tooltipWrapperClass}
        style={{ ...style, anchorName: anchor } as React.CSSProperties}
        aria-describedby={
          hasTitle && trigger === children
            ? [props["aria-describedby"], tooltipId].filter(Boolean).join(" ")
            : props["aria-describedby"]
        }
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={focusTooltip}
        onBlur={blurTooltip}
      >
        {trigger}
        {hasTitle ? (
          <span
            ref={surfaceRef}
            id={tooltipId}
            role="tooltip"
            popover={isControlled ? "manual" : "hint"}
            style={{ positionAnchor: anchor } as React.CSSProperties}
            className={getTooltipClasses({ placement, size, arrow, className })}
          >
            {title}
          </span>
        ) : null}
      </span>
    );
  },
);

Tooltip.displayName = "Tooltip";
