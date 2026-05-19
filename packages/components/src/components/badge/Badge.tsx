import React from "react";
import { getBadgeClasses } from "../../classes/badge";
import type { BadgeProps } from "./Badge.types";

export function Badge({
  color = "primary",
  appearance = "filled",
  size = "md",
  className,
  children,
  ref,
  ...props
}: BadgeProps) {
  const classes = getBadgeClasses({
    color,
    appearance,
    size,
    className,
  });

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
}
