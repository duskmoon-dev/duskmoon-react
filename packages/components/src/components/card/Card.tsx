import React from "react";
import { getCardClasses } from "../../classes/card";
import type { CardProps } from "./Card.types";

export function Card({
  appearance = "elevated",
  padding = "md",
  className,
  children,
  ref,
  ...props
}: CardProps) {
  const classes = getCardClasses({
    appearance,
    padding,
    className,
  });

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
}
