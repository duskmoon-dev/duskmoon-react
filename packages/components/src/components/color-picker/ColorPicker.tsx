import React, { forwardRef, useState } from "react";
import {
  colorPickerFormatSelectClass,
  colorPickerInputClass,
  colorPickerPanelClass,
  colorPickerPresetClass,
  colorPickerPresetColorsClass,
  colorPickerPresetLabelClass,
  colorPickerPresetsClass,
  colorPickerSwatchClass,
  colorPickerTextClass,
  getColorPickerClasses,
} from "../../classes/color-picker";
import type {
  ColorPickerComponent,
  ColorPickerFormat,
  ColorPickerProps,
  ColorValue,
  HSBColor,
  RGBColor,
} from "./ColorPicker.types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function componentToHex(value: number) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}

function isRgb(value: ColorValue): value is RGBColor {
  return typeof value === "object" && value !== null && "r" in value;
}

function isHsb(value: ColorValue): value is HSBColor {
  return typeof value === "object" && value !== null && "h" in value;
}

function hsbToRgb(value: HSBColor): RGBColor {
  const h = ((value.h % 360) + 360) % 360;
  const s = clamp(value.s, 0, 100) / 100;
  const brightness = clamp(value.b, 0, 100) / 100;
  const c = brightness * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = brightness - c;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];

  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
    a: value.a,
  };
}

function colorToRgb(value: ColorValue): RGBColor {
  if (isRgb(value)) return value;
  if (isHsb(value)) return hsbToRgb(value);

  const normalized = value.trim();
  if (normalized.startsWith("#")) {
    const hex = normalized.slice(1);
    const fullHex =
      hex.length === 3
        ? hex
            .split("")
            .map((item) => item + item)
            .join("")
        : hex.padEnd(6, "0").slice(0, 6);

    return {
      r: Number.parseInt(fullHex.slice(0, 2), 16),
      g: Number.parseInt(fullHex.slice(2, 4), 16),
      b: Number.parseInt(fullHex.slice(4, 6), 16),
    };
  }

  const match = normalized.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const [r, g, b, a] = match[1].split(",").map((part) => Number(part.trim()));
    return { r, g, b, a };
  }

  return { r: 0, g: 0, b: 0 };
}

function colorToCss(value: ColorValue, format: ColorPickerFormat) {
  const rgb = colorToRgb(value);

  if (format === "rgb") {
    return rgb.a !== undefined
      ? `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${rgb.a})`
      : `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
  }

  if (format === "hsb" && isHsb(value)) {
    return `hsb(${Math.round(value.h)}, ${Math.round(value.s)}%, ${Math.round(value.b)}%)`;
  }

  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
}

function parseInput(value: string, format: ColorPickerFormat): ColorValue {
  if (format === "rgb") {
    const rgb = colorToRgb(value);
    return {
      r: Math.round(rgb.r),
      g: Math.round(rgb.g),
      b: Math.round(rgb.b),
      a: rgb.a,
    };
  }

  return value;
}

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      className,
      defaultOpen,
      defaultValue = "#1677ff",
      disabled,
      format = "hex",
      onChange,
      onChangeComplete,
      onFormatChange,
      onOpenChange,
      open,
      panelRender,
      presets,
      showText,
      size = "middle",
      trigger = "click",
      value,
      ...props
    },
    ref,
  ) => {
    const valueControlled = value !== undefined;
    const openControlled = open !== undefined;
    const [innerValue, setInnerValue] = useState<ColorValue>(defaultValue);
    const [innerOpen, setInnerOpen] = useState(Boolean(defaultOpen));
    const currentValue = valueControlled ? value : innerValue;
    const visible = openControlled ? Boolean(open) : innerOpen;
    const cssValue = colorToCss(currentValue, format);

    function setVisible(nextOpen: boolean) {
      if (disabled) return;

      if (!openControlled) {
        setInnerOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    }

    function emitChange(nextValue: ColorValue) {
      const css = colorToCss(nextValue, format);

      if (!valueControlled) {
        setInnerValue(nextValue);
      }

      onChange?.(nextValue, css);
      onChangeComplete?.(nextValue, css);
    }

    const panel = (
      <div className={colorPickerPanelClass}>
        <input
          className={colorPickerInputClass}
          aria-label="Color value"
          value={cssValue}
          onChange={(event) =>
            emitChange(parseInput(event.currentTarget.value, format))
          }
        />
        {presets?.length ? (
          <div className={colorPickerPresetsClass}>
            {presets.map((preset, presetIndex) => (
              <div key={presetIndex} className={colorPickerPresetClass}>
                {preset.label ? (
                  <div className={colorPickerPresetLabelClass}>
                    {preset.label}
                  </div>
                ) : null}
                <div className={colorPickerPresetColorsClass}>
                  {preset.colors.map((presetColor, colorIndex) => {
                    const presetCss = colorToCss(presetColor, format);
                    return (
                      <button
                        key={`${presetIndex}-${colorIndex}`}
                        type="button"
                        aria-label={`Select color ${presetCss}`}
                        className={colorPickerSwatchClass}
                        style={{
                          backgroundColor: colorToCss(presetColor, "hex"),
                        }}
                        onClick={() => emitChange(presetColor)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );

    return (
      <div
        {...props}
        ref={ref}
        className={getColorPickerClasses({
          size,
          trigger,
          format,
          disabled,
          open: visible,
          className,
        })}
        onMouseEnter={() => {
          if (trigger === "hover") setVisible(true);
        }}
        onMouseLeave={() => {
          if (trigger === "hover") setVisible(false);
        }}
      >
        <button
          type="button"
          className={colorPickerSwatchClass}
          aria-label="Open color picker"
          disabled={disabled}
          style={{ backgroundColor: colorToCss(currentValue, "hex") }}
          onClick={() => {
            if (trigger === "click") setVisible(!visible);
          }}
        />
        {showText ? (
          <span className={colorPickerTextClass}>
            {typeof showText === "function" ? showText(cssValue) : cssValue}
          </span>
        ) : null}
        <select
          className={colorPickerFormatSelectClass}
          aria-label="Color format"
          value={format}
          disabled={disabled}
          onChange={(event) =>
            onFormatChange?.(event.currentTarget.value as ColorPickerFormat)
          }
        >
          <option value="hex">hex</option>
          <option value="rgb">rgb</option>
          <option value="hsb">hsb</option>
        </select>
        {visible ? (panelRender?.(panel) ?? panel) : null}
      </div>
    );
  },
) as ColorPickerComponent;

ColorPicker.displayName = "ColorPicker";
