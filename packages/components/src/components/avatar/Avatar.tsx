import React, { forwardRef, useState } from "react";
import { getAvatarClasses } from "../../classes/avatar";
import type { AvatarProps } from "./Avatar.types";

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      size = "md",
      shape = "circle",
      src,
      alt,
      fallback,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const [hasError, setHasError] = useState(false);

    const classes = getAvatarClasses({ size, shape, className });

    return (
      <span ref={ref} className={classes} {...props}>
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="avatar-image"
          />
        ) : (
          fallback || children
        )}
      </span>
    );
  },
);

Avatar.displayName = "Avatar";
