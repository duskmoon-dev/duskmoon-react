// GENERATED FILE. DO NOT EDIT.
import { cn } from "../utils";
import type {
  AlertColor,
  AlertAppearance,
} from "../components/alert/Alert.types";

export const alertBaseClass = "alert";

export const alertColorClasses: Record<AlertColor, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

export const alertAppearanceClasses: Record<AlertAppearance, string> = {
  filled: "",
  outline: "alert-outline",
  tonal: "alert-tonal",
};

export function getAlertClasses({
  color = "info",
  appearance = "filled",
  className,
}: {
  color?: AlertColor;
  appearance?: AlertAppearance;
  className?: string;
}) {
  return cn(
    alertBaseClass,
    alertColorClasses[color],
    alertAppearanceClasses[appearance],
    className,
  );
}
