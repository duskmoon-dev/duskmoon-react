import React, {
  forwardRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { getRateClasses, getRateItemClasses } from "../../classes/rate";
import type { RateCharacterRenderInfo, RateProps } from "./Rate.types";

function clampValue(value: number, count: number, allowHalf: boolean) {
  if (!Number.isFinite(value)) return 0;

  const clamped = Math.min(count, Math.max(0, value));
  const stepped = allowHalf ? Math.round(clamped * 2) / 2 : Math.round(clamped);

  return Math.min(count, Math.max(0, stepped));
}

function getClickValue(
  index: number,
  allowHalf: boolean,
  event: MouseEvent<HTMLElement>,
) {
  if (!allowHalf) return index;

  const rect = event.currentTarget.getBoundingClientRect();
  const isLeftHalf =
    rect.width > 0 && event.clientX <= rect.left + rect.width / 2;

  return isLeftHalf ? index - 0.5 : index;
}

function getCharacter({
  character,
  info,
}: {
  character: RateProps["character"];
  info: RateCharacterRenderInfo;
}) {
  if (typeof character === "function") {
    return character(info);
  }

  return character;
}

export const Rate = forwardRef<HTMLDivElement, RateProps>(
  (
    {
      value,
      defaultValue = 0,
      onChange,
      count = 5,
      allowHalf = false,
      allowClear = true,
      disabled = false,
      readOnly = false,
      character = "★",
      tooltips,
      className,
      size = "md",
      color = "primary",
      onKeyDown,
      tabIndex,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const safeCount = Math.max(0, Math.floor(count));
    const [internalValue, setInternalValue] = useState(() =>
      clampValue(defaultValue, safeCount, allowHalf),
    );
    const isControlled = value !== undefined;
    const currentValue = clampValue(
      isControlled ? value : internalValue,
      safeCount,
      allowHalf,
    );
    const isInteractive = !disabled && !readOnly;

    function commitValue(nextValue: number) {
      if (!isInteractive) return;

      const normalizedValue = clampValue(nextValue, safeCount, allowHalf);
      const finalValue =
        allowClear && normalizedValue === currentValue ? 0 : normalizedValue;

      if (finalValue === currentValue) return;

      if (!isControlled) {
        setInternalValue(finalValue);
      }

      onChange?.(finalValue);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);

      if (event.defaultPrevented || !isInteractive) return;

      const step = allowHalf ? 0.5 : 1;
      const keyValues: Record<string, number> = {
        ArrowRight: currentValue + step,
        ArrowUp: currentValue + step,
        ArrowLeft: currentValue - step,
        ArrowDown: currentValue - step,
        Home: 0,
        End: safeCount,
      };

      if (event.key in keyValues) {
        event.preventDefault();
        commitValue(keyValues[event.key]);
      }
    }

    return (
      <div
        {...props}
        ref={ref}
        role="radiogroup"
        aria-label={ariaLabel ?? "Rate"}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        tabIndex={tabIndex ?? -1}
        className={getRateClasses({
          size,
          color,
          disabled,
          readOnly,
          interactive: isInteractive,
          className,
        })}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: safeCount }, (_, itemIndex) => {
          const index = itemIndex + 1;
          const filled = currentValue >= index;
          const half = allowHalf && !filled && currentValue >= index - 0.5;
          const checked = currentValue > 0 && Math.ceil(currentValue) === index;
          const focusable =
            isInteractive && (checked || (currentValue === 0 && index === 1));
          const itemValue = half ? index - 0.5 : index;

          return (
            <span
              key={index}
              role="radio"
              aria-checked={checked}
              aria-disabled={disabled || undefined}
              aria-label={`${itemValue} of ${safeCount}`}
              tabIndex={focusable ? 0 : -1}
              title={tooltips?.[itemIndex]}
              className={getRateItemClasses({ filled, half })}
              onClick={(event) =>
                commitValue(getClickValue(index, allowHalf, event))
              }
              onKeyDown={(event) => {
                if (
                  !isInteractive ||
                  (event.key !== "Enter" && event.key !== " ")
                ) {
                  return;
                }

                event.preventDefault();
                commitValue(itemValue);
              }}
            >
              {getCharacter({
                character,
                info: { index, value: itemValue },
              })}
            </span>
          );
        })}
      </div>
    );
  },
);

Rate.displayName = "Rate";
