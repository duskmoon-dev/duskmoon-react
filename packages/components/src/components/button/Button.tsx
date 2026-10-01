import React from "react";
import { createPortal } from "react-dom";
import { getButtonClasses } from "../../classes/button";
import type { ButtonProps } from "./Button.types";

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as PromiseLike<unknown>).then === "function"
  );
}

export function Button({
  color = "primary",
  appearance = "filled",
  shape = "rect",
  size = "md",
  block,
  isLoading,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ref,
  confirm,
  onClick,
  ...props
}: ButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLFormElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const approvalRef = React.useRef<"idle" | "action" | "native">("idle");
  const pendingRef = React.useRef(false);
  const actionRef = React.useRef(0);
  const operationRef = React.useRef(0);
  const mountedRef = React.useRef(false);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [confirmError, setConfirmError] = React.useState(false);
  const generatedId = React.useId().replace(/:/g, "");
  const popoverId = `button-confirm-${generatedId}`;
  const titleId = `${popoverId}-title`;
  const descriptionId = `${popoverId}-description`;
  const anchor = `--${popoverId}-anchor`;
  const hasConfirm = Boolean(confirm);
  const confirmation = confirm && typeof confirm === "object" ? confirm : undefined;
  const title = confirmation ? confirmation.title : "Confirm action";
  const hasTitle = title !== undefined && title !== null && title !== false && title !== "";
  const content = confirmation?.component ?? confirmation?.message ?? confirmation?.description;
  const hasContent = content !== undefined && content !== null && content !== false && content !== "";
  const mergedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (!node) {
        if (typeof ref === "function") ref(null);
        else if (ref) ref.current = null;
        return;
      }
      const cleanup = typeof ref === "function" ? ref(node) : undefined;
      if (ref && typeof ref !== "function") ref.current = node;
      return () => {
        buttonRef.current = null;
        if (typeof cleanup === "function") cleanup();
        else if (typeof ref === "function") ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref],
  );

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      operationRef.current += 1;
    };
  }, []);

  React.useEffect(() => {
    operationRef.current += 1;
    approvalRef.current = "idle";
    setConfirmError(false);
    setPortalTarget(hasConfirm ? document.body : null);
  }, [hasConfirm]);

  function closePopover() {
    if (popoverRef.current?.matches(":popover-open")) {
      popoverRef.current.hidePopover();
    }
    buttonRef.current?.focus();
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (!confirm) {
      onClick?.(event);
      return;
    }

    if (approvalRef.current === "native") {
      approvalRef.current = "idle";
      return;
    }

    if (approvalRef.current === "action") {
      approvalRef.current = "idle";
      let result: unknown;

      try {
        result = onClick?.(event);
      } catch {
        event.preventDefault();
        pendingRef.current = false;
        setConfirmError(true);
        return;
      }

      if (!isPromiseLike(result)) {
        pendingRef.current = false;
        closePopover();
        return;
      }

      const userPreventedDefault = event.defaultPrevented;
      event.preventDefault();
      setConfirmLoading(true);
      const action = actionRef.current;
      const operation = operationRef.current;

      Promise.resolve(result).then(
        () => {
          if (!mountedRef.current || action !== actionRef.current) return;
          pendingRef.current = false;
          setConfirmLoading(false);
          if (operation !== operationRef.current) return;
          closePopover();
          if (!userPreventedDefault && !buttonRef.current?.disabled) {
            approvalRef.current = "native";
            buttonRef.current?.click();
            approvalRef.current = "idle";
          }
        },
        () => {
          if (!mountedRef.current || action !== actionRef.current) return;
          pendingRef.current = false;
          setConfirmLoading(false);
          if (operation !== operationRef.current) return;
          setConfirmError(true);
          cancelRef.current?.focus();
        },
      );
      return;
    }

    event.preventDefault();
    if (disabled || isLoading || pendingRef.current) return;
    if (popoverRef.current?.matches(":popover-open")) {
      closePopover();
      return;
    }
    setConfirmError(false);
    popoverRef.current?.showPopover();
    cancelRef.current?.focus();
  }

  function handleConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const trigger = buttonRef.current;
    if (
      disabled ||
      isLoading ||
      pendingRef.current ||
      !trigger ||
      trigger.disabled ||
      !event.currentTarget.matches(":popover-open")
    ) return;
    setConfirmError(false);
    pendingRef.current = true;
    actionRef.current += 1;
    approvalRef.current = "action";
    trigger.click();
    if (approvalRef.current === "action") {
      approvalRef.current = "idle";
      pendingRef.current = false;
    }
  }

  const classes = getButtonClasses({
    color,
    appearance,
    shape,
    size,
    block,
    isLoading,
    className,
  });
  const confirmClasses = getButtonClasses({
    color,
    size: "sm",
    isLoading: confirmLoading,
  });

  return (
    <>
      <button
        ref={confirm ? mergedRef : ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
        style={
          confirm
            ? ({ ...props.style, anchorName: anchor } as React.CSSProperties)
            : props.style
        }
        aria-haspopup={confirm ? "dialog" : props["aria-haspopup"]}
        aria-controls={confirm ? popoverId : props["aria-controls"]}
        onClick={confirm ? handleClick : onClick}
      >
        {isLoading && <span className="btn-spinner" />}
        {!isLoading && leftIcon && (
          <span className="btn-icon-left">{leftIcon}</span>
        )}
        <span className="btn-content">{children}</span>
        {!isLoading && rightIcon && (
          <span className="btn-icon-right">{rightIcon}</span>
        )}
      </button>
      {confirm && portalTarget && createPortal(
        <form
          id={popoverId}
          ref={popoverRef}
          popover="auto"
          role="dialog"
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-label={hasTitle ? undefined : "Confirm action"}
          aria-describedby={hasContent ? descriptionId : undefined}
          className="popover popover-confirm popover-bottom"
          style={{ positionAnchor: anchor } as React.CSSProperties}
          onSubmit={handleConfirm}
          onClick={(event) => event.stopPropagation()}
          onToggle={(event) => {
            if (!event.currentTarget.matches(":popover-open")) {
              operationRef.current += 1;
              if (
                event.currentTarget.contains(document.activeElement) ||
                document.activeElement === document.body
              ) {
                buttonRef.current?.focus();
              }
            }
          }}
        >
          {hasTitle && (
            <div className="popover-header">
              <h3 id={titleId} className="popover-title">{title}</h3>
            </div>
          )}
          {hasContent && (
            <div id={descriptionId} className="popover-body">
              {content}
            </div>
          )}
          {confirmError && (
            <div role="alert" className="popover-body">
              The action failed. Please try again.
            </div>
          )}
          <div className="popover-footer">
            <button
              ref={cancelRef}
              type="button"
              className="btn btn-text btn-sm"
              popoverTarget={popoverId}
              popoverTargetAction="hide"
              disabled={confirmLoading}
            >
              {confirmation?.cancelText ?? "Cancel"}
            </button>
            <button
              type="submit"
              className={confirmClasses}
              disabled={disabled || isLoading || confirmLoading}
              aria-busy={confirmLoading}
            >
              {confirmation?.confirmText ?? "Confirm"}
            </button>
          </div>
        </form>,
        portalTarget,
      )}
    </>
  );
}
