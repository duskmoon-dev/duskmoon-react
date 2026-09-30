import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  getCheckboxClasses,
  getCheckboxInputClasses,
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
          loading,
          className,
        })}
      >
        <input
          {...props}
          ref={inputRef}
          type="checkbox"
          className={getCheckboxInputClasses({ color, size, error })}
          disabled={isDisabled}
          aria-checked={indeterminate ? "mixed" : ariaChecked}
        />
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
