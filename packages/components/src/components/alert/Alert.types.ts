// GENERATED FILE. DO NOT EDIT.
import type { ComponentProps } from "react";

export type AlertColor = "info" | "success" | "warning" | "error";

export type AlertAppearance = "filled" | "outline" | "tonal";

export interface AlertProps extends ComponentProps<"div"> {
  color?: AlertColor;
  appearance?: AlertAppearance;
}
