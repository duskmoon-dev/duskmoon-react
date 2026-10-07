import type { ComponentProps } from "react";

export type OtpInputLength = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type OtpInputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type OtpInputVariant = "outlined" | "filled" | "underlined";
export type OtpInputColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "accent"
  | "neutral"
  | "base";

export interface OtpInputProps extends Omit<
  ComponentProps<"input">,
  "children" | "className" | "size" | "type"
> {
  /** Number of decorative slots. Native input constraints default to this length. */
  length?: OtpInputLength;
  size?: OtpInputSize;
  variant?: OtpInputVariant;
  color?: OtpInputColor;
  /** Additional class names for the wrapping label. */
  wrapperClassName?: string;
  /** Additional class names for the native input. */
  className?: string;
}
