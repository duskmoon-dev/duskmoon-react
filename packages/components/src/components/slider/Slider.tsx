import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  getSliderClasses,
  getSliderMarkClasses,
  sliderInputClass,
  sliderMarkLabelClass,
  sliderMarksClass,
  sliderThumbClass,
  sliderThumbLabelClass,
  sliderTrackClass,
  sliderTrackFilledClass,
} from "../../classes/slider";
import type {
  SliderMark,
  SliderMarkConfig,
  SliderProps,
  SliderTooltip,
  SliderValue,
} from "./Slider.types";

const hiddenInputStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "inherit",
  margin: 0,
  pointerEvents: "auto",
};

function isRangeValue(
  value: SliderValue | undefined,
): value is [number, number] {
  return Array.isArray(value);
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function getSafeBounds(min: number, max: number) {
  return min <= max ? [min, max] : [max, min];
}

function normalizeStep(step: number | null | undefined) {
  if (step === null || step === undefined) return undefined;
  return Number.isFinite(step) && step > 0 ? step : undefined;
}

function snapToStep(
  value: number,
  min: number,
  max: number,
  step: number | null | undefined,
) {
  const safeStep = normalizeStep(step);
  const clampedValue = clamp(value, min, max);

  if (!safeStep) return clampedValue;

  const snapped = Math.round((clampedValue - min) / safeStep) * safeStep + min;
  const decimals = `${safeStep}`.split(".")[1]?.length ?? 0;

  return clamp(Number(snapped.toFixed(decimals)), min, max);
}

function normalizeScalarValue({
  value,
  min,
  max,
  step,
}: {
  value: number;
  min: number;
  max: number;
  step?: number | null;
}) {
  return snapToStep(value, min, max, step);
}

function normalizeRangeValue({
  value,
  min,
  max,
  step,
}: {
  value: SliderValue | undefined;
  min: number;
  max: number;
  step?: number | null;
}): [number, number] {
  const nextValue = isRangeValue(value) ? value : [min, value ?? min];
  const lower = normalizeScalarValue({ value: nextValue[0], min, max, step });
  const upper = normalizeScalarValue({ value: nextValue[1], min, max, step });

  return lower <= upper ? [lower, upper] : [upper, lower];
}

function normalizeValue({
  value,
  min,
  max,
  step,
  range,
}: {
  value: SliderValue | undefined;
  min: number;
  max: number;
  step?: number | null;
  range: boolean;
}): SliderValue {
  if (range) {
    return normalizeRangeValue({ value, min, max, step });
  }

  return normalizeScalarValue({
    value: isRangeValue(value) ? value[0] : (value ?? min),
    min,
    max,
    step,
  });
}

function valuesEqual(first: SliderValue, second: SliderValue) {
  if (Array.isArray(first) || Array.isArray(second)) {
    return (
      Array.isArray(first) &&
      Array.isArray(second) &&
      first[0] === second[0] &&
      first[1] === second[1]
    );
  }

  return first === second;
}

function getPercent(value: number, min: number, max: number, reverse: boolean) {
  if (max === min) return 0;

  const percent = ((value - min) / (max - min)) * 100;

  return reverse ? 100 - percent : percent;
}

function getFilledStyle({
  value,
  min,
  max,
  reverse,
  vertical,
}: {
  value: SliderValue;
  min: number;
  max: number;
  reverse: boolean;
  vertical: boolean;
}): CSSProperties {
  if (Array.isArray(value)) {
    const first = getPercent(value[0], min, max, reverse);
    const second = getPercent(value[1], min, max, reverse);
    const start = Math.min(first, second);
    const end = Math.max(first, second);
    const size = `${end - start}%`;

    return vertical
      ? { bottom: `${start}%`, height: size }
      : { left: `${start}%`, width: size };
  }

  const percent = getPercent(value, min, max, reverse);

  if (vertical) {
    return reverse
      ? { top: 0, height: `${percent}%` }
      : { bottom: 0, height: `${percent}%` };
  }

  return reverse
    ? { left: `${percent}%`, width: `${100 - percent}%` }
    : { left: 0, width: `${percent}%` };
}

function getThumbStyle({
  value,
  min,
  max,
  reverse,
  vertical,
}: {
  value: number;
  min: number;
  max: number;
  reverse: boolean;
  vertical: boolean;
}): CSSProperties {
  const percent = getPercent(value, min, max, reverse);

  return vertical ? { bottom: `${percent}%` } : { left: `${percent}%` };
}

function isMarkConfig(mark: SliderMark): mark is SliderMarkConfig {
  return (
    typeof mark === "object" &&
    mark !== null &&
    !React.isValidElement(mark) &&
    ("label" in mark || "style" in mark || "className" in mark)
  );
}

function getMarkLabel(mark: SliderMark) {
  return isMarkConfig(mark) ? mark.label : mark;
}

function getMarkStyle(mark: SliderMark) {
  return isMarkConfig(mark) ? mark.style : undefined;
}

function getMarkClassName(mark: SliderMark) {
  return isMarkConfig(mark) ? mark.className : undefined;
}

function isMarkActive(value: SliderValue, markValue: number) {
  if (Array.isArray(value)) {
    return markValue >= value[0] && markValue <= value[1];
  }

  return markValue <= value;
}

function getTooltipLabel(tooltip: SliderTooltip | undefined, value: number) {
  if (tooltip === false) return null;

  if (typeof tooltip === "function") {
    return tooltip(value);
  }

  if (
    typeof tooltip === "object" &&
    tooltip !== null &&
    "formatter" in tooltip
  ) {
    return tooltip.formatter === null ? null : tooltip.formatter?.(value);
  }

  return value;
}

function shouldShowTooltipAlways(tooltip: SliderTooltip | undefined) {
  return typeof tooltip === "object" && tooltip !== null && tooltip.open;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onAfterChange,
      min = 0,
      max = 100,
      step = 1,
      range = false,
      disabled = false,
      vertical = false,
      marks,
      tooltip,
      reverse = false,
      size = "md",
      color = "primary",
      className,
      onInputKeyDown,
      ...props
    },
    ref,
  ) => {
    const [safeMin, safeMax] = getSafeBounds(min, max);
    const isRange =
      Boolean(range) || isRangeValue(value) || isRangeValue(defaultValue);
    const isControlled = value !== undefined;
    const initialValue = useMemo(
      () =>
        normalizeValue({
          value: defaultValue,
          min: safeMin,
          max: safeMax,
          step,
          range: isRange,
        }),
      [defaultValue, isRange, safeMax, safeMin, step],
    );
    const [internalValue, setInternalValue] =
      useState<SliderValue>(initialValue);
    const currentValue = normalizeValue({
      value: isControlled ? value : internalValue,
      min: safeMin,
      max: safeMax,
      step,
      range: isRange,
    });
    const lastCommittedValue = useRef(currentValue);

    useEffect(() => {
      lastCommittedValue.current = currentValue;
    }, [currentValue]);

    function commitValue(nextValue: SliderValue) {
      if (disabled) return;

      const normalizedValue = normalizeValue({
        value: nextValue,
        min: safeMin,
        max: safeMax,
        step,
        range: isRange,
      });

      lastCommittedValue.current = normalizedValue;

      if (!isControlled) {
        setInternalValue(normalizedValue);
      }

      if (!valuesEqual(currentValue, normalizedValue)) {
        onChange?.(normalizedValue);
      }
    }

    function commitThumbValue(index: 0 | 1, nextThumbValue: number) {
      if (!isRange) {
        commitValue(nextThumbValue);
        return;
      }

      const rangeValue = Array.isArray(currentValue)
        ? currentValue
        : normalizeRangeValue({
            value: currentValue,
            min: safeMin,
            max: safeMax,
            step,
          });

      const nextRange: [number, number] =
        index === 0
          ? [nextThumbValue, rangeValue[1]]
          : [rangeValue[0], nextThumbValue];

      commitValue(nextRange);
    }

    function emitAfterChange() {
      if (!disabled) {
        onAfterChange?.(lastCommittedValue.current);
      }
    }

    function handleInputKeyDown(
      event: KeyboardEvent<HTMLInputElement>,
      index: 0 | 1,
    ) {
      onInputKeyDown?.(event);

      if (event.defaultPrevented || disabled) return;

      const safeStep = normalizeStep(step) ?? 1;
      const currentThumbValue = Array.isArray(currentValue)
        ? currentValue[index]
        : currentValue;
      const reverseFactor = reverse ? -1 : 1;
      const deltas: Record<string, number> = {
        ArrowRight: safeStep * reverseFactor,
        ArrowUp: safeStep,
        ArrowLeft: -safeStep * reverseFactor,
        ArrowDown: -safeStep,
      };

      if (event.key === "Home") {
        event.preventDefault();
        commitThumbValue(index, safeMin);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        commitThumbValue(index, safeMax);
        return;
      }

      if (event.key in deltas) {
        event.preventDefault();
        commitThumbValue(index, currentThumbValue + deltas[event.key]);
      }
    }

    const rootClassName = getSliderClasses({
      size,
      color,
      range: isRange,
      vertical,
      disabled,
      tooltipOpen: shouldShowTooltipAlways(tooltip),
      className,
    });
    const values = Array.isArray(currentValue) ? currentValue : [currentValue];
    const markEntries = Object.entries(marks ?? {})
      .map(([markValue, mark]) => [Number(markValue), mark] as const)
      .filter(([markValue]) => Number.isFinite(markValue))
      .sort(([first], [second]) => first - second);
    const inputStep = step === null ? undefined : step;

    return (
      <div
        {...props}
        ref={ref}
        aria-disabled={disabled || undefined}
        className={rootClassName}
      >
        <div className={sliderTrackClass}>
          <div
            className={sliderTrackFilledClass}
            style={getFilledStyle({
              value: currentValue,
              min: safeMin,
              max: safeMax,
              reverse,
              vertical,
            })}
          />

          {markEntries.length > 0 ? (
            <div className={sliderMarksClass} aria-hidden="true">
              {markEntries.map(([markValue, mark]) => {
                const percent = getPercent(
                  markValue,
                  safeMin,
                  safeMax,
                  reverse,
                );
                const offsetStyle = vertical
                  ? { bottom: `${percent}%` }
                  : { left: `${percent}%` };

                return (
                  <span
                    key={markValue}
                    className={getSliderMarkClasses({
                      active: isMarkActive(currentValue, markValue),
                      className: getMarkClassName(mark),
                    })}
                    style={{ ...offsetStyle, ...getMarkStyle(mark) }}
                  >
                    <span className={sliderMarkLabelClass}>
                      {getMarkLabel(mark)}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : null}

          {values.map((thumbValue, index) => {
            const tooltipLabel = getTooltipLabel(tooltip, thumbValue);

            return (
              <span
                key={index}
                className={sliderThumbClass}
                style={getThumbStyle({
                  value: thumbValue,
                  min: safeMin,
                  max: safeMax,
                  reverse,
                  vertical,
                })}
              >
                {tooltipLabel !== null ? (
                  <span className={sliderThumbLabelClass}>{tooltipLabel}</span>
                ) : null}
              </span>
            );
          })}

          {values.map((thumbValue, index) => (
            <input
              key={index}
              type="range"
              aria-label={
                isRange
                  ? index === 0
                    ? "Minimum value"
                    : "Maximum value"
                  : "Slider value"
              }
              className={sliderInputClass}
              min={safeMin}
              max={safeMax}
              step={inputStep}
              disabled={disabled}
              value={thumbValue}
              style={hiddenInputStyle}
              onChange={(event) =>
                commitThumbValue(
                  index as 0 | 1,
                  Number(event.currentTarget.value),
                )
              }
              onMouseUp={emitAfterChange}
              onTouchEnd={emitAfterChange}
              onBlur={emitAfterChange}
              onKeyDown={(event) => handleInputKeyDown(event, index as 0 | 1)}
              onKeyUp={emitAfterChange}
            />
          ))}
        </div>
      </div>
    );
  },
);

Slider.displayName = "Slider";
