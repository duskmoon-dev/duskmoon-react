"use client";

import React from "react";
import { getButtonClasses } from "./Button.classes";
import type { ButtonProps } from "./Button.types";

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ref,
  ...props
}: ButtonProps) {
  const classes = getButtonClasses({ variant, size, isLoading, className });

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
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
