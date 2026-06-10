import React, { forwardRef } from "react";
import {
  getRadioCircleClasses,
  getRadioClasses,
  getRadioLabelClasses,
  radioDotClass,
  radioInputClass,
} from "../../classes/radio";
import type { RadioProps } from "./Radio.types";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      color = "primary",
      size = "md",
      error,
      loading,
      labelPosition = "right",
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <label
        className={getRadioClasses({
          size,
          error,
          loading,
          className,
        })}
      >
        <input
          {...props}
          ref={ref}
          type="radio"
          className={radioInputClass}
          disabled={isDisabled}
        />
        <span className={getRadioCircleClasses({ color })} aria-hidden="true">
          <span className={radioDotClass} />
        </span>
        {children ? (
          <span className={getRadioLabelClasses({ labelPosition })}>
            {children}
          </span>
        ) : null}
      </label>
    );
  },
);

Radio.displayName = "Radio";
