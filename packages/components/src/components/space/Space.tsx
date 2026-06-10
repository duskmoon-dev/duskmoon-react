import React, { Children, forwardRef, isValidElement } from "react";
import {
  getSpaceClasses,
  getSpaceCompactClasses,
  spaceItemClass,
  spaceSplitClass,
} from "../../classes/space";
import type {
  SpaceAlign,
  SpaceComponent,
  SpaceCompactProps,
  SpaceProps,
  SpaceSize,
} from "./Space.types";

const sizeMap = {
  small: 8,
  middle: 16,
  large: 24,
} as const;

const alignMap: Record<SpaceAlign, React.CSSProperties["alignItems"]> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  baseline: "baseline",
};

function resolveSize(size?: SpaceSize | [SpaceSize, SpaceSize]) {
  if (Array.isArray(size)) {
    return size.map((item) => sizeMap[item as keyof typeof sizeMap] ?? item);
  }

  return sizeMap[size as keyof typeof sizeMap] ?? sizeMap.small;
}

const SpaceBase = forwardRef<HTMLDivElement, SpaceProps>(
  (
    {
      size = "small",
      direction = "horizontal",
      align,
      split,
      wrap,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const gap = resolveSize(size);
    const childList = Children.toArray(children).filter(
      (child) => child !== null && child !== undefined,
    );

    return (
      <div
        {...props}
        ref={ref}
        className={getSpaceClasses({ direction, wrap, className })}
        style={{
          display: "inline-flex",
          flexDirection: direction === "vertical" ? "column" : undefined,
          flexWrap: wrap ? "wrap" : undefined,
          alignItems: align ? alignMap[align] : undefined,
          gap: Array.isArray(gap) ? `${gap[0]}px ${gap[1]}px` : gap,
          ...style,
        }}
      >
        {childList.map((child, index) => (
          <React.Fragment key={isValidElement(child) ? child.key : index}>
            <div className={spaceItemClass}>{child}</div>
            {split && index < childList.length - 1 ? (
              <span className={spaceSplitClass}>{split}</span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    );
  },
);

SpaceBase.displayName = "Space";

const Compact = forwardRef<HTMLDivElement, SpaceCompactProps>(
  (
    {
      block,
      direction = "horizontal",
      size = "middle",
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const gap = resolveSize(size);

    return (
      <div
        {...props}
        ref={ref}
        className={getSpaceCompactClasses({ block, direction, className })}
        style={{
          display: block ? "flex" : "inline-flex",
          flexDirection: direction === "vertical" ? "column" : undefined,
          gap: typeof gap === "number" ? gap : undefined,
          ...style,
        }}
      >
        {children}
      </div>
    );
  },
);

Compact.displayName = "Space.Compact";

export const Space = SpaceBase as SpaceComponent;
Space.Compact = Compact;
