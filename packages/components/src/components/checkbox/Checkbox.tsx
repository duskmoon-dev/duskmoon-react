import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  checkboxCheckmarkClass,
  checkboxInputClass,
  getCheckboxBoxClasses,
  getCheckboxClasses,
  getCheckboxLabelClasses,
} from "../../classes/checkbox";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      color = "primary",
      size = "md",
      indeterminate = false,
      error,
      loading,
      labelPosition = "right",
      className,
      children,
      disabled,
      "aria-checked": ariaChecked,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const isDisabled = disabled || loading;

    return (
      <label
        className={getCheckboxClasses({
          size,
          error,
          loading,
          className,
        })}
      >
        <input
          {...props}
          ref={inputRef}
          type="checkbox"
          className={checkboxInputClass}
          disabled={isDisabled}
          aria-checked={indeterminate ? "mixed" : ariaChecked}
        />
        <span className={getCheckboxBoxClasses({ color })} aria-hidden="true">
          <span className={checkboxCheckmarkClass}>
            {indeterminate ? "-" : "✓"}
          </span>
        </span>
        {children ? (
          <span className={getCheckboxLabelClasses({ labelPosition })}>
            {children}
          </span>
        ) : null}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
