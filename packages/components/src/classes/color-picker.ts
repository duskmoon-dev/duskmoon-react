import type {
  ColorPickerFormat,
  ColorPickerSize,
  ColorPickerTrigger,
} from "../components/color-picker/ColorPicker.types";
import { cn } from "../utils";

export const colorPickerBaseClass = "color-picker";
export const colorPickerSwatchClass = "color-picker-swatch";
export const colorPickerTextClass = "color-picker-text";
export const colorPickerPanelClass = "color-picker-panel popover popover-show";
export const colorPickerInputClass = "color-picker-input input";
export const colorPickerPresetsClass = "color-picker-presets";
export const colorPickerPresetClass = "color-picker-preset";
export const colorPickerPresetLabelClass = "color-picker-preset-label";
export const colorPickerPresetColorsClass = "color-picker-preset-colors";

export const colorPickerSizeClasses: Record<ColorPickerSize, string> = {
  small: "color-picker-sm",
  middle: "color-picker-md",
  large: "color-picker-lg",
  sm: "color-picker-sm",
  md: "color-picker-md",
  lg: "color-picker-lg",
};

export const colorPickerTriggerClasses: Record<ColorPickerTrigger, string> = {
  hover: "color-picker-trigger-hover",
  click: "color-picker-trigger-click",
};

export const colorPickerFormatClasses: Record<ColorPickerFormat, string> = {
  hex: "color-picker-format-hex",
  rgb: "color-picker-format-rgb",
  hsb: "color-picker-format-hsb",
};

export function getColorPickerClasses({
  size = "middle",
  trigger = "click",
  format = "hex",
  disabled,
  open,
  className,
}: {
  size?: ColorPickerSize;
  trigger?: ColorPickerTrigger;
  format?: ColorPickerFormat;
  disabled?: boolean;
  open?: boolean;
  className?: string;
}) {
  return cn(
    colorPickerBaseClass,
    colorPickerSizeClasses[size],
    colorPickerTriggerClasses[trigger],
    colorPickerFormatClasses[format],
    disabled && "color-picker-disabled",
    open && "color-picker-open",
    className,
  );
}
