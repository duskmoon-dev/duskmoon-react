import React, { forwardRef, useEffect, useState } from "react";
import {
  getImageClasses,
  getImagePreviewGroupClasses,
  imageImgClass,
  imagePlaceholderClass,
  imagePreviewMaskClass,
} from "../../classes/image";
import { cn } from "../../utils";
import type {
  ImageComponent,
  ImagePreview,
  ImagePreviewGroupProps,
  ImageProps,
} from "./Image.types";

function previewEnabled(preview: ImagePreview | undefined) {
  return preview !== false;
}

function previewConfig(preview: ImagePreview | undefined) {
  return typeof preview === "object" && preview !== null ? preview : {};
}

function renderPlaceholder(placeholder: ImageProps["placeholder"]) {
  if (
    placeholder === false ||
    placeholder === undefined ||
    placeholder === null
  ) {
    return null;
  }

  return (
    <span className={imagePlaceholderClass}>
      {placeholder === true ? null : placeholder}
    </span>
  );
}

const ImageBase = forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      src,
      alt,
      fallback,
      placeholder,
      preview = true,
      width,
      height,
      className,
      imgClassName,
      wrapperClassName,
      onError,
      onLoad,
      ...imgProps
    },
    ref,
  ) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [loading, setLoading] = useState(Boolean(src));
    const [failed, setFailed] = useState(false);
    const [internalPreviewVisible, setInternalPreviewVisible] = useState(false);
    const config = previewConfig(preview);
    const isPreviewEnabled = previewEnabled(preview);
    const previewVisible = config.visible ?? internalPreviewVisible;
    const hasImage = Boolean(currentSrc);

    useEffect(() => {
      setCurrentSrc(src);
      setLoading(Boolean(src));
      setFailed(false);
    }, [src]);

    function setPreviewVisible(nextVisible: boolean) {
      const previousVisible = previewVisible;
      setInternalPreviewVisible(nextVisible);
      config.onVisibleChange?.(nextVisible, previousVisible);
    }

    function handleLoad(event: React.SyntheticEvent<HTMLImageElement>) {
      setLoading(false);
      setFailed(false);
      onLoad?.(event);
    }

    function handleError(event: React.SyntheticEvent<HTMLImageElement>) {
      onError?.(event);

      if (fallback && currentSrc !== fallback) {
        setCurrentSrc(fallback);
        setLoading(true);
        setFailed(false);
        return;
      }

      setLoading(false);
      setFailed(true);
    }

    return (
      <span
        ref={ref}
        className={cn(
          getImageClasses({
            preview: isPreviewEnabled,
            error: failed,
            className,
          }),
          wrapperClassName,
        )}
        style={{ width, height }}
        data-preview-enabled={isPreviewEnabled || undefined}
        data-preview-visible={previewVisible || undefined}
      >
        {hasImage ? (
          <img
            {...imgProps}
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            className={cn(imageImgClass, imgClassName)}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : null}
        {!hasImage || loading ? renderPlaceholder(placeholder) : null}
        {isPreviewEnabled && hasImage && !failed ? (
          <button
            type="button"
            className={imagePreviewMaskClass}
            aria-label="Preview image"
            onClick={() => setPreviewVisible(!previewVisible)}
          >
            {config.mask}
          </button>
        ) : null}
        {previewVisible && isPreviewEnabled ? (
          <img
            src={config.src ?? currentSrc}
            alt={alt}
            className={cn(imageImgClass, "image-preview-img")}
            aria-hidden="true"
          />
        ) : null}
      </span>
    );
  },
);

ImageBase.displayName = "Image";

const PreviewGroup = forwardRef<HTMLDivElement, ImagePreviewGroupProps>(
  ({ preview = true, className, children, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={getImagePreviewGroupClasses({ className })}
      data-preview-enabled={previewEnabled(preview) || undefined}
    >
      {children}
    </div>
  ),
);

PreviewGroup.displayName = "Image.PreviewGroup";

export const Image = Object.assign(ImageBase, {
  PreviewGroup,
}) as ImageComponent;
