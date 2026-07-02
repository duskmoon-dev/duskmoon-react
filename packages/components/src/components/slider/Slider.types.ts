import type {
  ComponentProps,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from "react";

export type SliderValue = number | [number, number];

export type SliderSize = "sm" | "md" | "lg";

export type SliderColor =
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

export interface SliderMarkConfig {
  label?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export type SliderMark = ReactNode | SliderMarkConfig;

export type SliderMarks = Record<number, SliderMark>;

export type SliderTooltipFormatter = (value: number) => ReactNode;

export interface SliderTooltipConfig {
  open?: boolean;
  formatter?: SliderTooltipFormatter | null;
}

export type SliderTooltip =
  | boolean
  | SliderTooltipFormatter
  | SliderTooltipConfig;

export interface SliderRangeConfig {
  draggableTrack?: boolean;
}

export interface SliderProps extends Omit<
  ComponentProps<"div">,
  "children" | "color" | "defaultValue" | "onChange"
> {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onChange?: (value: SliderValue) => void;
  onAfterChange?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number | null;
  range?: boolean | SliderRangeConfig;
  disabled?: boolean;
  vertical?: boolean;
  marks?: SliderMarks;
  tooltip?: SliderTooltip;
  reverse?: boolean;
  size?: SliderSize;
  color?: SliderColor;
  onInputKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}
