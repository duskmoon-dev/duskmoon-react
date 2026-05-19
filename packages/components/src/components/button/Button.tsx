

import React from "react";
import { getButtonClasses } from "../../classes/button";
import type { ButtonProps } from "./Button.types";

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
  ...props
}: ButtonProps) {
  const classes = getButtonClasses({
    color,
    appearance,
    shape,
    size,
    block,
    isLoading,
    className,
  });

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
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
  );
}
