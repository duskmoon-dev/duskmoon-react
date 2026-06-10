import React, { forwardRef } from "react";
import { getColClasses } from "../../classes/col";
import type { ColProps, ColResponsiveValue } from "./Col.types";

const breakpointOrder = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;

function toResponsiveObject(value?: ColResponsiveValue) {
  if (typeof value === "number") {
    return { span: value };
  }

  return value;
}

function spanToBasis(span?: number) {
  if (span === undefined) return undefined;
  if (span <= 0) return "0 0 0";

  return `0 0 ${(span / 24) * 100}%`;
}

function offsetToMargin(offset?: number) {
  return offset === undefined ? undefined : `${(offset / 24) * 100}%`;
}

export const Col = forwardRef<HTMLDivElement, ColProps>(
  (
    {
      className,
      flex,
      offset,
      order,
      pull,
      push,
      span,
      style,
      xs,
      sm,
      md,
      lg,
      xl,
      xxl,
      ...props
    },
    ref,
  ) => {
    const responsive = { xs, sm, md, lg, xl, xxl };
    const dataAttrs = Object.fromEntries(
      breakpointOrder
        .map((key) => {
          const value = toResponsiveObject(responsive[key]);
          return value ? [`data-${key}-span`, value.span] : undefined;
        })
        .filter((entry): entry is [string, number | undefined] => Boolean(entry)),
    );
    const leftShift = push ? `${(push / 24) * 100}%` : undefined;
    const rightShift = pull ? `${(pull / 24) * 100}%` : undefined;

    return (
      <div
        {...props}
        {...dataAttrs}
        ref={ref}
        className={getColClasses({ className })}
        style={{
          flex: flex ?? spanToBasis(span),
          maxWidth: span === undefined ? undefined : `${(span / 24) * 100}%`,
          marginInlineStart: offsetToMargin(offset),
          order,
          position: push || pull ? "relative" : undefined,
          left: leftShift,
          right: rightShift,
          ...style,
        }}
      />
    );
  },
);

Col.displayName = "Col";
