import { cn } from "../utils";
import type {
  OtpInputColor,
  OtpInputSize,
  OtpInputVariant,
} from "../components/otp-input/OtpInput.types";

export const otpInputBaseClass = "otp-input";
export const otpInputCodeClass = "otp-code";

const otpInputSizeClasses: Record<OtpInputSize, string> = {
  xs: "otp-input-xs",
  sm: "otp-input-sm",
  md: "otp-input-md",
  lg: "otp-input-lg",
  xl: "otp-input-xl",
};

const otpInputVariantClasses: Record<OtpInputVariant, string> = {
  outlined: "",
  filled: "otp-input-filled",
  underlined: "otp-input-underline",
};

const otpInputColorClasses: Record<OtpInputColor, string> = {
  primary: "otp-input-primary",
  secondary: "otp-input-secondary",
  tertiary: "otp-input-tertiary",
  info: "otp-input-info",
  success: "otp-input-success",
  warning: "otp-input-warning",
  error: "otp-input-error",
  accent: "otp-input-accent",
  neutral: "otp-input-neutral",
  base: "otp-input-base",
};

export function getOtpInputClasses({
  size = "md",
  variant = "outlined",
  color,
  wrapperClassName,
}: {
  size?: OtpInputSize;
  variant?: OtpInputVariant;
  color?: OtpInputColor;
  wrapperClassName?: string;
}) {
  return cn(
    otpInputBaseClass,
    otpInputSizeClasses[size],
    otpInputVariantClasses[variant],
    color && otpInputColorClasses[color],
    wrapperClassName,
  );
}

export function getOtpInputCodeClasses({ className }: { className?: string }) {
  return cn(otpInputCodeClass, className);
}
