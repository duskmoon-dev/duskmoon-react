import React, { forwardRef } from "react";
import {
  emptyDescriptionClass,
  emptyFooterClass,
  emptyImageClass,
  getEmptyClasses,
} from "../../classes/empty";
import type { EmptyComponent, EmptyProps } from "./Empty.types";

const defaultImage = (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 64 48"
    width="64"
    height="48"
  >
    <rect
      x="8"
      y="12"
      width="48"
      height="28"
      rx="4"
      fill="currentColor"
      opacity="0.16"
    />
    <path
      d="M16 20h32M16 28h20"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.38"
    />
  </svg>
);

const simpleImage = (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 48 36"
    width="48"
    height="36"
  >
    <rect
      x="6"
      y="10"
      width="36"
      height="20"
      rx="3"
      fill="currentColor"
      opacity="0.16"
    />
  </svg>
);

const EmptyBase = forwardRef<HTMLDivElement, EmptyProps>(
  (
    {
      image = defaultImage,
      imageStyle,
      description = "No data",
      children,
      className,
      ...props
    },
    ref,
  ) => (
    <div ref={ref} className={getEmptyClasses({ className })} {...props}>
      {image !== null && image !== false ? (
        <div className={emptyImageClass} style={imageStyle}>
          {image}
        </div>
      ) : null}
      {description !== false ? (
        <div className={emptyDescriptionClass}>{description}</div>
      ) : null}
      {children ? <div className={emptyFooterClass}>{children}</div> : null}
    </div>
  ),
);

EmptyBase.displayName = "Empty";

export const Empty = EmptyBase as EmptyComponent;
Empty.PRESENTED_IMAGE_DEFAULT = defaultImage;
Empty.PRESENTED_IMAGE_SIMPLE = simpleImage;
