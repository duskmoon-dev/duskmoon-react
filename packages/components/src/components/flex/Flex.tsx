import React, { forwardRef } from "react";
import { getFlexClasses } from "../../classes/flex";
import type { FlexAlign, FlexGap, FlexJustify, FlexProps } from "./Flex.types";

const gapMap = {
  small: 8,
  middle: 16,
  large: 24,
} as const;

const justifyMap: Record<FlexJustify, React.CSSProperties["justifyContent"]> = {
  normal: "normal",
  start: "flex-start",
  end: "flex-end",
  center: "center",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

const alignMap: Record<FlexAlign, React.CSSProperties["alignItems"]> = {
  normal: "normal",
  start: "flex-start",
  end: "flex-end",
  center: "center",
  baseline: "baseline",
  stretch: "stretch",
};

function resolveGap(gap?: FlexGap | [FlexGap, FlexGap]) {
  if (Array.isArray(gap)) {
    return gap.map((item) => gapMap[item as keyof typeof gapMap] ?? item);
  }

  return gapMap[gap as keyof typeof gapMap] ?? gap;
}

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (
    {
      component: Component = "div",
      vertical,
      wrap,
      justify = "normal",
      align = "normal",
      gap,
      flex,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedGap = resolveGap(gap);

    return (
      <Component
        {...props}
        ref={ref}
        className={getFlexClasses({ vertical, wrap, className })}
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : undefined,
          flexWrap: typeof wrap === "string" ? wrap : wrap ? "wrap" : undefined,
          justifyContent: justifyMap[justify],
          alignItems: alignMap[align],
          gap: Array.isArray(resolvedGap)
            ? `${resolvedGap[0]}px ${resolvedGap[1]}px`
            : resolvedGap,
          flex,
          ...style,
        }}
      >
        {children}
      </Component>
    );
  },
);

Flex.displayName = "Flex";
