import React, { forwardRef } from "react";
import { getRowClasses } from "../../classes/row";
import type { RowAlign, RowJustify, RowProps } from "./Row.types";

const alignStyleMap: Record<RowAlign, React.CSSProperties["alignItems"]> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
  stretch: "stretch",
};

const justifyStyleMap: Record<
  RowJustify,
  React.CSSProperties["justifyContent"]
> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  "space-around": "space-around",
  "space-between": "space-between",
  "space-evenly": "space-evenly",
};

function resolveGutter(gutter?: RowProps["gutter"]) {
  if (Array.isArray(gutter)) {
    return gutter;
  }

  return [gutter ?? 0, 0] as [number, number];
}

export const Row = forwardRef<HTMLDivElement, RowProps>(
  (
    {
      align,
      justify,
      gutter,
      wrap = true,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const [horizontalGutter, verticalGutter] = resolveGutter(gutter);

    return (
      <div
        {...props}
        ref={ref}
        className={getRowClasses({ align, justify, wrap, className })}
        style={{
          display: "flex",
          flexFlow: wrap ? "row wrap" : "row nowrap",
          alignItems: align ? alignStyleMap[align] : undefined,
          justifyContent: justify ? justifyStyleMap[justify] : undefined,
          columnGap: horizontalGutter,
          rowGap: verticalGutter,
          ...style,
        }}
      >
        {children}
      </div>
    );
  },
);

Row.displayName = "Row";
