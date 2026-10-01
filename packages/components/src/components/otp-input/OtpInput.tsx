import { forwardRef } from "react";
import {
  getOtpInputClasses,
  getOtpInputCodeClasses,
} from "../../classes/otp-input";
import type { OtpInputProps } from "./OtpInput.types";

export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  (
    {
      length = 6,
      size = "md",
      variant = "outlined",
      color,
      wrapperClassName,
      className,
      autoComplete,
      inputMode,
      minLength,
      maxLength,
      pattern,
      ...inputProps
    },
    ref,
  ) => (
    <label
      className={getOtpInputClasses({
        size,
        variant,
        color,
        wrapperClassName,
      })}
    >
      {Array.from({ length }, (_, index) => (
        <span key={index} aria-hidden="true" />
      ))}
      <input
        {...inputProps}
        ref={ref}
        type="text"
        className={getOtpInputCodeClasses({ className })}
        autoComplete={autoComplete ?? "one-time-code"}
        inputMode={inputMode ?? "numeric"}
        minLength={minLength ?? length}
        maxLength={maxLength ?? length}
        pattern={pattern ?? `[0-9]{${length}}`}
      />
    </label>
  ),
);

OtpInput.displayName = "OtpInput";
