import { cn } from "../utils";
import type {
  SliderColor,
  SliderSize,
} from "../components/slider/Slider.types";

export const sliderBaseClass = "slider";
export const sliderTrackClass = "slider-track";
export const sliderTrackFilledClass = "slider-track-filled";
export const sliderThumbClass = "slider-thumb";
export const sliderThumbLabelClass = "slider-thumb-label";
export const sliderInputClass = "slider-input";
export const sliderMarksClass = "slider-marks";
export const sliderMarkClass = "slider-mark";
export const sliderMarkActiveClass = "slider-mark-active";
export const sliderMarkLabelClass = "slider-mark-label";
export const sliderRangeClass = "slider-range";
export const sliderVerticalClass = "slider-vertical";
export const sliderDisabledClass = "slider-disabled";
export const sliderLabelsAlwaysClass = "slider-labels-always";

export const sliderSizeClasses: Record<SliderSize, string> = {
  sm: "slider-sm",
  md: "",
  lg: "slider-lg",
};

export const sliderColorClasses: Record<SliderColor, string> = {
  primary: "",
  secondary: "slider-secondary",
  tertiary: "slider-tertiary",
};

export function getSliderClasses({
  size = "md",
  color = "primary",
  range,
  vertical,
  disabled,
  tooltipOpen,
  className,
}: {
  size?: SliderSize;
  color?: SliderColor;
  range?: boolean;
  vertical?: boolean;
  disabled?: boolean;
  tooltipOpen?: boolean;
  className?: string;
}) {
  return cn(
    sliderBaseClass,
    sliderSizeClasses[size],
    sliderColorClasses[color],
    range && sliderRangeClass,
    vertical && sliderVerticalClass,
    disabled && sliderDisabledClass,
    tooltipOpen && sliderLabelsAlwaysClass,
    className,
  );
}

export function getSliderMarkClasses({
  active,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return cn(sliderMarkClass, active && sliderMarkActiveClass, className);
}
