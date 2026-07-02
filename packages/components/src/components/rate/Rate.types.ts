import type { ComponentProps, ReactNode } from "react";

export type RateSize = "sm" | "md" | "lg" | "xl";

export type RateColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "neutral"
  | "base"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface RateCharacterRenderInfo {
  index: number;
  value: number;
}

export type RateCharacter =
  | ReactNode
  | ((info: RateCharacterRenderInfo) => ReactNode);

export interface RateProps extends Omit<
  ComponentProps<"div">,
  "children" | "className" | "color" | "defaultValue" | "onChange"
> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  character?: RateCharacter;
  tooltips?: string[];
  className?: string;
  size?: RateSize;
  color?: RateColor;
}
