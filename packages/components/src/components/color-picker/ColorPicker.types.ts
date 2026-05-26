import type {
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type ColorPickerFormat = "hex" | "rgb" | "hsb";
export type ColorPickerTrigger = "hover" | "click";
export type ColorPickerSize = "small" | "middle" | "large" | "sm" | "md" | "lg";

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface HSBColor {
  h: number;
  s: number;
  b: number;
  a?: number;
}

export type ColorValue = string | RGBColor | HSBColor;

export interface ColorPreset {
  label?: ReactNode;
  colors: ColorValue[];
}

export interface ColorPickerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "onChange"> {
  value?: ColorValue;
  defaultValue?: ColorValue;
  format?: ColorPickerFormat;
  presets?: ColorPreset[];
  trigger?: ColorPickerTrigger;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  showText?: boolean | ((color: string) => ReactNode);
  size?: ColorPickerSize;
  panelRender?: (panel: ReactNode) => ReactNode;
  onChange?: (value: ColorValue, css: string) => void;
  onChangeComplete?: (value: ColorValue, css: string) => void;
  onFormatChange?: (format: ColorPickerFormat) => void;
  onOpenChange?: (open: boolean) => void;
}

export type ColorPickerComponent = ForwardRefExoticComponent<
  ColorPickerProps & RefAttributes<HTMLDivElement>
>;
