/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, {
  forwardRef,
  useId,
  useState,
  type FocusEvent,
  type MouseEvent,
} from "react";
import {
  getPopconfirmClasses,
  popconfirmActionsClass,
  popconfirmArrowClass,
  popconfirmBodyClass,
  popconfirmContentClass,
  popconfirmDescriptionClass,
  popconfirmIconClass,
  popconfirmTitleClass,
  popconfirmWrapperClass,
} from "../../classes/popconfirm";
import { Button } from "../button";
import type { PopconfirmProps, PopconfirmTrigger } from "./Popconfirm.types";

function normalizeTriggers(
  trigger: PopconfirmProps["trigger"],
): PopconfirmTrigger[] {
  return Array.isArray(trigger) ? trigger : [trigger ?? "click"];
}

function hasTrigger(
  triggers: PopconfirmProps["trigger"],
  trigger: PopconfirmTrigger,
) {
  return normalizeTriggers(triggers).includes(trigger);
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return Boolean(
    value &&
    (typeof value === "object" || typeof value === "function") &&
    "then" in value &&
    typeof (value as Promise<unknown>).then === "function",
  );
}

export const Popconfirm = forwardRef<HTMLSpanElement, PopconfirmProps>(
  (
    {
      arrow = true,
      cancelButtonProps,
      cancelText = "Cancel",
      children,
      className,
      defaultOpen,
      description,
      destroyTooltipOnHide,
      disabled,
      icon = "!",
      id,
      okButtonProps,
      okText = "OK",
      onCancel,
      onClick,
      onConfirm,
      onContextMenu,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      onOpenChange,
      open,
      placement = "top",
      showCancel = true,
      title,
      trigger = "click",
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
    const [confirmLoading, setConfirmLoading] = useState(false);
    const generatedPopupId = useId();
    const isControlled = open !== undefined;
    const visible = isControlled ? open : internalOpen;
    const popupId = id ? `${id}-popconfirm` : generatedPopupId;

    function setVisible(nextOpen: boolean) {
      if (disabled) {
        return;
      }

      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    }

    function close() {
      setVisible(false);
    }

    async function runAction(
      action: ((event: MouseEvent<HTMLButtonElement>) => unknown) | undefined,
      event: MouseEvent<HTMLButtonElement>,
      loading?: boolean,
    ) {
      event.preventDefault();
      event.stopPropagation();

      const result = action?.(event);

      if (!isPromiseLike(result)) {
        close();
        return;
      }

      if (loading) {
        setConfirmLoading(true);
      }

      try {
        await result;
        close();
      } finally {
        if (loading) {
          setConfirmLoading(false);
        }
      }
    }

    function handleMouseEnter(event: MouseEvent<HTMLSpanElement>) {
      onMouseEnter?.(event);
      if (hasTrigger(trigger, "hover")) {
        setVisible(true);
      }
    }

    function handleMouseLeave(event: MouseEvent<HTMLSpanElement>) {
      onMouseLeave?.(event);
      if (hasTrigger(trigger, "hover")) {
        setVisible(false);
      }
    }

    function handleClick(event: MouseEvent<HTMLSpanElement>) {
      onClick?.(event);
      if (hasTrigger(trigger, "click")) {
        setVisible(!visible);
      }
    }

    function handleContextMenu(event: MouseEvent<HTMLSpanElement>) {
      onContextMenu?.(event);
      if (
        hasTrigger(trigger, "contextMenu") ||
        hasTrigger(trigger, "contextmenu")
      ) {
        event.preventDefault();
        setVisible(!visible);
      }
    }

    function handleFocus(event: FocusEvent<HTMLSpanElement>) {
      onFocus?.(event);
      if (hasTrigger(trigger, "focus")) {
        setVisible(true);
      }
    }

    function handleBlur(event: FocusEvent<HTMLSpanElement>) {
      onBlur?.(event);
      if (hasTrigger(trigger, "focus")) {
        setVisible(false);
      }
    }

    const shouldRenderPopup = !destroyTooltipOnHide || visible;

    return (
      <span
        {...props}
        ref={ref}
        className={popconfirmWrapperClass}
        aria-describedby={visible ? popupId : undefined}
        aria-expanded={visible || undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
        {shouldRenderPopup ? (
          <span
            id={popupId}
            role="tooltip"
            className={getPopconfirmClasses({
              placement,
              open: visible,
              arrow,
              className,
            })}
          >
            <span className={popconfirmBodyClass}>
              {icon ? (
                <span className={popconfirmIconClass}>{icon}</span>
              ) : null}
              <span className={popconfirmContentClass}>
                {title ? (
                  <span className={popconfirmTitleClass}>{title}</span>
                ) : null}
                {description ? (
                  <span className={popconfirmDescriptionClass}>
                    {description}
                  </span>
                ) : null}
              </span>
            </span>
            <span className={popconfirmActionsClass}>
              {showCancel ? (
                <Button
                  appearance="text"
                  color="secondary"
                  size="sm"
                  {...cancelButtonProps}
                  onClick={(event) => {
                    void runAction(onCancel, event);
                  }}
                >
                  {cancelText}
                </Button>
              ) : null}
              <Button
                color="primary"
                size="sm"
                {...okButtonProps}
                isLoading={confirmLoading || okButtonProps?.isLoading}
                onClick={(event) => {
                  void runAction(onConfirm, event, true);
                }}
              >
                {okText}
              </Button>
            </span>
            {arrow ? <span className={popconfirmArrowClass} /> : null}
          </span>
        ) : null}
      </span>
    );
  },
);

Popconfirm.displayName = "Popconfirm";
