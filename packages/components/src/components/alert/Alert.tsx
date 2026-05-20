import React, { forwardRef } from "react";
import { getAlertClasses } from "../../classes/alert";
import type { AlertProps } from "./Alert.types";

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, color = "info", appearance = "filled", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={getAlertClasses({ color, appearance, className })}
        {...props}
      />
    );
  }
);

Alert.displayName = "Alert";
