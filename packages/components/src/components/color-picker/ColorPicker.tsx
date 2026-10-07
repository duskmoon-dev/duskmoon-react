import React, {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
  if (/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(normalized)) {
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

function colorToHsb(value: ColorValue): HSBColor {
  if (isHsb(value))
    return {
      ...value,
      h: ((value.h % 360) + 360) % 360,
      s: clamp(value.s, 0, 100),
      b: clamp(value.b, 0, 100),
    };
  const rgb = colorToRgb(value);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((part) =>
    Number.isFinite(part) ? clamp(part, 0, 255) / 255 : 0,
  );
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  const hue =
    delta === 0
      ? 0
      : max === r
        ? ((g - b) / delta) % 6
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4;
  return {
    h: (hue * 60 + 360) % 360,
    s: max === 0 ? 0 : (delta / max) * 100,
    b: max * 100,
    a: rgb.a,
  };
}

function colorToCss(value: ColorValue, format: ColorPickerFormat) {
  const rgb = colorToRgb(value);

  if (format === "rgb") {
    return rgb.a !== undefined
      ? `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${rgb.a})`
      : `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
  }

  if (format === "hsb") {
    const hsb = colorToHsb(value);
    return `hsb(${Math.round(hsb.h)}, ${Math.round(hsb.s)}%, ${Math.round(hsb.b)}%)`;
  }

  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
}

function parseInput(value: string, format: ColorPickerFormat): ColorValue {
  if (format === "hsb") {
    const match = value.match(
      /^hsb\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i,
    );
    if (match)
      return { h: Number(match[1]), s: Number(match[2]), b: Number(match[3]) };
    return value;
  }
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
      triggerProps,
      value,
      ...props
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelId = useId();
    useImperativeHandle(ref, () => rootRef.current!, []);
    const valueControlled = value !== undefined;
    const openControlled = open !== undefined;
    const [innerValue, setInnerValue] = useState<ColorValue>(defaultValue);
    const [innerOpen, setInnerOpen] = useState(Boolean(defaultOpen));
    const currentValue = valueControlled ? value : innerValue;
    const visible = openControlled ? Boolean(open) : innerOpen;
    const cssValue = colorToCss(currentValue, format);
    const [lastSelection, setLastSelection] = useState(() =>
      colorToHsb(currentValue),
    );
    const selection = colorToHsb(currentValue);
    // Retain the hue and saturation that RGB cannot represent at white/black.
    if (selection.s === 0 || selection.b === 0) selection.h = lastSelection.h;
    if (selection.b === 0) selection.s = lastSelection.s;
    if (selection.h === 0 && lastSelection.h === 360) selection.h = 360;
    const pointerId = useRef<number | null>(null);
    const instructionsId = useId();

    function setVisible(nextOpen: boolean) {
      if (disabled) return;

      if (!openControlled) {
        setInnerOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    }

    useEffect(() => {
      if (!visible) return;
      function dismissOutside(event: PointerEvent) {
        if (!rootRef.current?.contains(event.target as Node)) setVisible(false);
      }
      function dismissEscape(event: KeyboardEvent) {
        if (
          event.key === "Escape" &&
          rootRef.current?.contains(event.target as Node)
        ) {
          event.preventDefault();
          setVisible(false);
          triggerRef.current?.focus();
        }
      }
      document.addEventListener("pointerdown", dismissOutside);
      document.addEventListener("keydown", dismissEscape);
      return () => {
        document.removeEventListener("pointerdown", dismissOutside);
        document.removeEventListener("keydown", dismissEscape);
      };
    });

    function emitChange(nextValue: ColorValue, complete = true) {
      if (disabled) return;
      const css = colorToCss(nextValue, format);

      if (!valueControlled) {
        setInnerValue(nextValue);
      }

      onChange?.(nextValue, css);
      if (complete) onChangeComplete?.(nextValue, css);
    }

    function selectColor(next: HSBColor, complete = true) {
      if (disabled) return;
      setLastSelection(next);
      emitChange(
        format === "hex"
          ? colorToCss(next, "hex")
          : format === "rgb"
            ? hsbToRgb(next)
            : next,
        complete,
      );
    }

    function selectPosition(
      event: React.PointerEvent<HTMLDivElement>,
      complete = false,
    ) {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (disabled || bounds.width === 0 || bounds.height === 0) return;
      selectColor(
        {
          ...selection,
          s: clamp(
            ((event.clientX - bounds.left) / bounds.width) * 100,
            0,
            100,
          ),
          b: clamp(
            100 - ((event.clientY - bounds.top) / bounds.height) * 100,
            0,
            100,
          ),
        },
        complete,
      );
    }

    const panel = (
      <div
        id={panelId}
        className={colorPickerPanelClass}
        role="dialog"
        aria-label="Choose color"
      >
        <div
          className="color-picker-area"
          role="slider"
          aria-label="Saturation and brightness"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(selection.s)}
          aria-valuetext={`Saturation ${Math.round(selection.s)}%, brightness ${Math.round(selection.b)}%`}
          aria-describedby={instructionsId}
          aria-disabled={Boolean(disabled)}
          tabIndex={disabled ? -1 : 0}
          style={
            { "--color-picker-hue": `${selection.h}` } as React.CSSProperties
          }
          onPointerDown={(event) => {
            if (disabled || event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.focus();
            pointerId.current = event.pointerId;
            event.currentTarget.setPointerCapture?.(event.pointerId);
            selectPosition(event);
          }}
          onPointerMove={(event) => {
            if (pointerId.current === event.pointerId) selectPosition(event);
          }}
          onPointerUp={(event) => {
            if (pointerId.current !== event.pointerId) return;
            selectPosition(event, true);
            pointerId.current = null;
            event.currentTarget.releasePointerCapture?.(event.pointerId);
          }}
          onPointerCancel={() => {
            pointerId.current = null;
          }}
          onLostPointerCapture={() => {
            pointerId.current = null;
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            const step = event.shiftKey ? 10 : 1;
            let { s, b } = selection;
            switch (event.key) {
              case "ArrowLeft":
                s -= step;
                break;
              case "ArrowRight":
                s += step;
                break;
              case "ArrowDown":
                b -= step;
                break;
              case "ArrowUp":
                b += step;
                break;
              case "Home":
                s = 0;
                break;
              case "End":
                s = 100;
                break;
              default:
                return;
            }
            event.preventDefault();
            selectColor({
              ...selection,
              s: clamp(s, 0, 100),
              b: clamp(b, 0, 100),
            });
          }}
        >
          <span
            className="color-picker-area-indicator"
            aria-hidden="true"
            style={{
              left: `${selection.s}%`,
              top: `${100 - selection.b}%`,
              backgroundColor: colorToCss(currentValue, "hex"),
            }}
          />
        </div>
        <span id={instructionsId} className="color-picker-instructions">
          Left/right: saturation. Up/down: brightness. Shift: larger steps.
        </span>
        <input
          className="color-picker-hue"
          type="range"
          aria-label="Hue"
          min={0}
          max={360}
          step={1}
          value={selection.h}
          disabled={disabled}
          onChange={(event) =>
            selectColor({ ...selection, h: Number(event.currentTarget.value) })
          }
        />
        <input
          className={colorPickerInputClass}
          aria-label="Color value"
          value={
            format === "hex" && typeof currentValue === "string"
              ? currentValue
              : cssValue
          }
          disabled={disabled}
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
                        disabled={disabled}
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
        ref={rootRef}
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
          {...triggerProps}
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={visible}
          aria-controls={visible ? panelId : undefined}
          className={colorPickerSwatchClass}
          aria-label={triggerProps?.["aria-label"] ?? "Open color picker"}
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
