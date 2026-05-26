import React, { forwardRef } from "react";
import { getDividerClasses } from "../../classes/divider";
import { cn } from "../../utils";
import type { DividerProps } from "./Divider.types";

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = "horizontal",
      variant = "solid",
      thickness = "thin",
      color = "neutral",
      spacing = "normal",
      labelPosition = "center",
      className,
      children,
      role = "separator",
      ...props
    },
    ref,
  ) => {
    const labelClass =
      children && orientation === "horizontal"
        ? {
            center: "divider-text",
            left: "divider-text-left",
            right: "divider-text-right",
          }[labelPosition]
        : undefined;

    return (
      <div
        ref={ref}
        role={role}
        aria-orientation={orientation}
        className={getDividerClasses({
          orientation,
          variant,
          thickness,
          color,
          spacing,
          className: cn(labelClass, className),
        })}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Divider.displayName = "Divider";
