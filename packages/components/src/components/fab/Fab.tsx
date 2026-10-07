import React, { forwardRef, useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../utils";
import { Button } from "../button";
import type { ButtonProps } from "../button/Button.types";

export interface FabProps extends Omit<ComponentProps<"div">, "children"> {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
  contained?: boolean;
  start?: boolean;
  extended?: boolean;
  buttonProps?: Omit<
    ButtonProps,
    "children" | "type" | "popoverTarget" | "aria-label"
  >;
}

export const Fab = forwardRef<HTMLDivElement, FabProps>(
  (
    {
      label,
      children,
      actions,
      contained = false,
      start = false,
      extended = false,
      buttonProps,
      className,
      ...props
    },
    ref,
  ) => {
    const actionsId = useId();
    const hasActions = actions !== undefined && actions !== null;
    const { className: buttonClassName, ...restButtonProps } =
      buttonProps ?? {};

    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          "fab",
          contained && "fab-contained",
          start && "fab-start",
          hasActions && "fab-speed-dial",
          className,
        )}
      >
        <Button
          {...restButtonProps}
          type="button"
          aria-label={label}
          className={cn(
            "fab-trigger",
            extended ? "fab-extended" : "btn-icon",
            buttonClassName,
          )}
          popoverTarget={hasActions ? actionsId : undefined}
        >
          {children}
        </Button>
        {hasActions ? (
          <div className="fab-actions" id={actionsId} popover="auto">
            {actions}
          </div>
        ) : null}
      </div>
    );
  },
);

Fab.displayName = "Fab";

export interface FabActionProps extends ComponentProps<"div"> {
  label?: ReactNode;
}

export const FabAction = forwardRef<HTMLDivElement, FabActionProps>(
  ({ label, children, className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn("fab-action", className)}>
      {label ? <span className="fab-label">{label}</span> : null}
      {children}
    </div>
  ),
);

FabAction.displayName = "FabAction";
