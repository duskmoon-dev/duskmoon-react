import { cn } from "../utils";
import type {
  SwitchColor,
  SwitchSize,
} from "../components/switch/Switch.types";

export const switchBaseClass = "switch";
export const switchInputClass = "switch-input";
export const switchTrackClass = "switch-track";
export const switchThumbClass = "switch-thumb";
export const switchLoadingClass = "switch-loading";

export const switchSizeClasses: Record<SwitchSize, string> = {
  sm: "switch-sm",
  md: "",
  lg: "switch-lg",
};

export const switchColorClasses: Record<SwitchColor, string> = {
  primary: "switch-primary",
  secondary: "switch-secondary",
  tertiary: "switch-tertiary",
  accent: "switch-accent",
  neutral: "switch-neutral",
  base: "switch-base",
  info: "switch-info",
  success: "switch-success",
  warning: "switch-warning",
  error: "switch-error",
};

export function getSwitchClasses({
  size = "md",
  loading,
  className,
}: {
  size?: SwitchSize;
  loading?: boolean;
  className?: string;
}) {
  return cn(
    switchBaseClass,
    switchSizeClasses[size],
    loading && switchLoadingClass,
    className,
  );
}

export function getSwitchTrackClasses({
  color = "primary",
}: {
  color?: SwitchColor;
}) {
  return cn(switchTrackClass, switchColorClasses[color]);
}
