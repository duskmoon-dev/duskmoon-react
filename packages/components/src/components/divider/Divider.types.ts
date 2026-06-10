// GENERATED FILE. DO NOT EDIT.
import type { ComponentProps } from "react";

export type DividerOrientation = "horizontal" | "vertical";

export type DividerVariant = "solid" | "dashed" | "dotted";

export type DividerThickness = "thin" | "medium" | "thick";

export type DividerColor = "neutral" | "primary" | "secondary" | "tertiary";

export type DividerSpacing = "normal" | "compact" | "comfortable" | "spacious";

export interface DividerProps extends ComponentProps<"div"> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  thickness?: DividerThickness;
  color?: DividerColor;
  spacing?: DividerSpacing;
  labelPosition?: "center" | "left" | "right";
}
