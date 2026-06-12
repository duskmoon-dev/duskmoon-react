import React, { forwardRef } from "react";
import {
  dmStatusContentClass,
  dmStatusImageClass,
  dmStatusLoadingClass,
  getDmStatusClasses,
} from "../../classes/dm-status";
import { Empty } from "../empty";
import { Spin } from "../spin";
import type { DmStatusProps } from "./DmStatus.types";

const defaultDescriptions = {
  empty: "No data",
  error: "Loading failed",
} as const;

const emptyImage = (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 96 72"
    width="96"
    height="72"
  >
    <rect
      x="14"
      y="18"
      width="68"
      height="40"
      rx="6"
      fill="currentColor"
      opacity="0.12"
    />
    <path
      d="M28 31h40M28 42h24"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.32"
    />
  </svg>
);

const errorImage = (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 96 72"
    width="96"
    height="72"
  >
    <circle cx="48" cy="36" r="25" fill="currentColor" opacity="0.12" />
    <path
      d="M39 27l18 18M57 27L39 45"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.48"
    />
  </svg>
);

function normalizeHeight(height?: string | number) {
  if (typeof height === "number") {
    return `${height}px`;
  }

  return height ?? "100%";
}

function normalizeImage(
  image: string | React.ReactNode,
  imageStyle?: React.CSSProperties,
) {
  if (typeof image !== "string") {
    return image;
  }

  return (
    <img src={image} alt="" className={dmStatusImageClass} style={imageStyle} />
  );
}

export const DmStatus = forwardRef<HTMLDivElement, DmStatusProps>(
  (
    {
      status = "empty",
      height,
      style,
      loadingProps,
      description,
      image,
      imageStyle,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    if (status === "success") {
      return <>{children}</>;
    }

    const mergedStyle = {
      height: normalizeHeight(height),
      ...style,
    };

    if (status === "loading") {
      return (
        <div
          ref={ref}
          className={getDmStatusClasses({ status, className })}
          style={mergedStyle}
          {...props}
        >
          <Spin {...loadingProps} wrapperClassName={dmStatusLoadingClass}>
            {children}
          </Spin>
        </div>
      );
    }

    const finalImage = normalizeImage(
      image ?? (status === "error" ? errorImage : emptyImage),
      imageStyle,
    );
    const finalDescription =
      description ??
      defaultDescriptions[status === "error" ? "error" : "empty"];

    return (
      <div
        ref={ref}
        className={getDmStatusClasses({ status, className })}
        style={mergedStyle}
        {...props}
      >
        <div className={dmStatusContentClass}>
          <Empty
            image={finalImage}
            imageStyle={typeof image === "string" ? undefined : imageStyle}
            description={finalDescription}
          >
            {children}
          </Empty>
        </div>
      </div>
    );
  },
);

DmStatus.displayName = "DmStatus";

export default DmStatus;
