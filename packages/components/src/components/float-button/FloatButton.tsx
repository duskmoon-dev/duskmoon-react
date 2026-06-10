import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  floatButtonBadgeClass,
  floatButtonDescriptionClass,
  floatButtonIconClass,
  floatButtonTooltipClass,
  getFloatButtonBackTopClasses,
  getFloatButtonClasses,
  getFloatButtonGroupClasses,
} from "../../classes/float-button";
import { cn } from "../../utils";
import type {
  FloatButtonBackTopProps,
  FloatButtonBadge,
  FloatButtonComponent,
  FloatButtonGroupProps,
  FloatButtonProps,
  FloatButtonShape,
  FloatButtonTooltip,
  FloatButtonTooltipConfig,
} from "./FloatButton.types";

const FloatButtonGroupContext = createContext<{ shape?: FloatButtonShape }>({});

function isTooltipConfig(
  tooltip: FloatButtonTooltip,
): tooltip is FloatButtonTooltipConfig {
  return (
    typeof tooltip === "object" &&
    tooltip !== null &&
    !React.isValidElement(tooltip) &&
    "title" in tooltip
  );
}

function getTooltip(tooltip: FloatButtonTooltip | undefined) {
  if (!tooltip) return undefined;
  return isTooltipConfig(tooltip) ? tooltip : { title: tooltip };
}

function renderBadge(badge: FloatButtonBadge | undefined) {
  if (!badge) return null;

  const overflowCount = badge.overflowCount ?? 99;
  const count =
    typeof badge.count === "number" && badge.count > overflowCount
      ? `${overflowCount}+`
      : badge.count;
  const visible = badge.dot || count !== undefined;

  if (!visible) return null;

  return (
    <span
      className={cn(
        floatButtonBadgeClass,
        "badge badge-error absolute -right-1 -top-1",
        badge.dot && "badge-dot h-2 min-h-2 w-2 min-w-2 rounded-full p-0",
      )}
      style={badge.color ? { backgroundColor: badge.color } : undefined}
      aria-hidden={badge.dot ? true : undefined}
    >
      {badge.dot ? null : count}
    </span>
  );
}

function isWindowTarget(target: Window | HTMLElement): target is Window {
  return typeof Window !== "undefined" && target instanceof Window;
}

function getTarget(target?: FloatButtonBackTopProps["target"]) {
  if (typeof window === "undefined") return null;
  return target?.() ?? window;
}

function getScrollTop(target: Window | HTMLElement | null) {
  if (!target) return 0;
  return isWindowTarget(target) ? target.scrollY : target.scrollTop;
}

function scrollToTop(target: Window | HTMLElement | null) {
  if (!target) return;
  target.scrollTo({ top: 0, behavior: "smooth" });
}

const InternalFloatButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  FloatButtonProps
>(
  (
    {
      icon,
      type = "default",
      shape,
      tooltip,
      description,
      badge,
      href,
      target,
      className,
      children,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const group = useContext(FloatButtonGroupContext);
    const mergedShape = shape ?? group.shape ?? "circle";
    const tooltipConfig = getTooltip(tooltip);
    const content = (
      <>
        {icon ? <span className={floatButtonIconClass}>{icon}</span> : null}
        {description ? (
          <span className={floatButtonDescriptionClass}>{description}</span>
        ) : null}
        {!icon && !description ? children : null}
        {renderBadge(badge)}
      </>
    );
    const classes = getFloatButtonClasses({
      type,
      shape: mergedShape,
      hasDescription: Boolean(description),
      className,
    });
    const tooltipNode = tooltipConfig?.title ? (
      <span
        role="tooltip"
        className={cn(
          floatButtonTooltipClass,
          "tooltip tooltip-show",
          tooltipConfig.placement && `tooltip-${tooltipConfig.placement}`,
        )}
      >
        {tooltipConfig.title}
      </span>
    ) : null;

    if (href) {
      return (
        <a
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled ? undefined : href}
          target={target}
          className={classes}
          aria-disabled={disabled || undefined}
          onClick={(event) => {
            if (disabled) {
              event.preventDefault();
              return;
            }
            onClick?.(event as React.MouseEvent<HTMLButtonElement> &
              React.MouseEvent<HTMLAnchorElement>);
          }}
        >
          {content}
          {tooltipNode}
        </a>
      );
    }

    return (
      <button
        {...props}
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        className={classes}
        onClick={(event) => {
          onClick?.(event);
        }}
      >
        {content}
        {tooltipNode}
      </button>
    );
  },
);

InternalFloatButton.displayName = "FloatButton";

const FloatButtonGroup = forwardRef<HTMLDivElement, FloatButtonGroupProps>(
  (
    {
      shape = "circle",
      trigger,
      open,
      closeIcon,
      children,
      className,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const isControlled = open !== undefined;
    const [internalOpen, setInternalOpen] = useState(trigger ? false : true);
    const visible = isControlled ? open : internalOpen;

    return (
      <FloatButtonGroupContext.Provider value={{ shape }}>
        <div
          {...props}
          ref={ref}
          className={getFloatButtonGroupClasses({
            shape,
            open: visible,
            className,
          })}
          onMouseEnter={(event) => {
            onMouseEnter?.(event);
            if (!isControlled && trigger === "hover") {
              setInternalOpen(true);
            }
          }}
          onMouseLeave={(event) => {
            onMouseLeave?.(event);
            if (!isControlled && trigger === "hover") {
              setInternalOpen(false);
            }
          }}
        >
          {visible ? children : null}
          {trigger === "click" ? (
            <button
              type="button"
              className="float-button-group-trigger"
              aria-expanded={visible}
              onClick={(event) => {
                onClick?.(event);
                if (!isControlled) {
                  setInternalOpen((current) => !current);
                }
              }}
            >
              {closeIcon ?? (visible ? "Close" : "Open")}
            </button>
          ) : null}
        </div>
      </FloatButtonGroupContext.Provider>
    );
  },
);

FloatButtonGroup.displayName = "FloatButton.Group";

const FloatButtonBackTop = forwardRef<HTMLButtonElement, FloatButtonBackTopProps>(
  (
    {
      visibilityHeight = 400,
      target,
      icon = "Top",
      tooltip,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const visibleRef = useRef(visible);
    visibleRef.current = visible;

    useEffect(() => {
      const scrollTarget = getTarget(target);
      if (!scrollTarget) return undefined;

      function updateVisible() {
        const nextVisible = getScrollTop(scrollTarget) >= visibilityHeight;
        if (nextVisible !== visibleRef.current) {
          visibleRef.current = nextVisible;
          setVisible(nextVisible);
        }
      }

      updateVisible();
      scrollTarget.addEventListener("scroll", updateVisible);
      return () => scrollTarget.removeEventListener("scroll", updateVisible);
    }, [target, visibilityHeight]);

    return (
      <InternalFloatButton
        {...props}
        ref={ref}
        icon={icon}
        tooltip={tooltip}
        className={cn(
          getFloatButtonBackTopClasses({ visible }),
          className,
        )}
        hidden={!visible}
        aria-label={props["aria-label"] ?? "Back to top"}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            scrollToTop(getTarget(target));
          }
        }}
      />
    );
  },
);

FloatButtonBackTop.displayName = "FloatButton.BackTop";

export const FloatButton = Object.assign(InternalFloatButton, {
  Group: FloatButtonGroup,
  BackTop: FloatButtonBackTop,
}) as FloatButtonComponent;
