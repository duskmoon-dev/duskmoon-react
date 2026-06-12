import React, { forwardRef, useMemo } from "react";
import {
  getWatermarkClasses,
  watermarkContentClass,
} from "../../classes/watermark";
import type { WatermarkProps } from "./Watermark.types";

function encodeSvg(svg: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function createWatermarkSvg({
  content,
  image,
  width,
  height,
  rotate,
  font,
}: Pick<
  WatermarkProps,
  "content" | "font" | "height" | "image" | "rotate" | "width"
>) {
  const text =
    typeof content === "string" || typeof content === "number"
      ? String(content)
      : "";
  const color = font?.color ?? "rgba(0, 0, 0, 0.12)";
  const fontSize = font?.fontSize ?? 16;
  const viewWidth = width ?? 180;
  const viewHeight = height ?? 120;

  if (image) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewWidth}" height="${viewHeight}" viewBox="0 0 ${viewWidth} ${viewHeight}"><g transform="rotate(${rotate ?? -22} ${viewWidth / 2} ${viewHeight / 2})"><image href="${image}" width="${viewWidth}" height="${viewHeight}" opacity="0.16"/></g></svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewWidth}" height="${viewHeight}" viewBox="0 0 ${viewWidth} ${viewHeight}"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${color}" font-size="${fontSize}" font-family="${font?.fontFamily ?? "sans-serif"}" font-weight="${font?.fontWeight ?? 400}" font-style="${font?.fontStyle ?? "normal"}" transform="rotate(${rotate ?? -22} ${viewWidth / 2} ${viewHeight / 2})">${text}</text></svg>`;
}

export const Watermark = forwardRef<HTMLDivElement, WatermarkProps>(
  (
    {
      children,
      className,
      content,
      image,
      width = 180,
      height = 120,
      rotate = -22,
      zIndex = 9,
      gap = [100, 100],
      offset = [0, 0],
      font,
      inherit,
      style,
      ...props
    },
    ref,
  ) => {
    const backgroundImage = useMemo(
      () =>
        encodeSvg(
          createWatermarkSvg({ content, image, width, height, rotate, font }),
        ),
      [content, font, height, image, rotate, width],
    );

    return (
      <div
        {...props}
        ref={ref}
        className={getWatermarkClasses({ className })}
        style={{ position: "relative", ...style }}
      >
        <div className={watermarkContentClass}>{children}</div>
        <div
          aria-hidden="true"
          data-watermark-source={
            image ??
            (typeof content === "string" || typeof content === "number"
              ? String(content)
              : undefined)
          }
          data-inherit={inherit || undefined}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex,
            backgroundImage,
            backgroundRepeat: "repeat",
            backgroundSize: `${width + gap[0]}px ${height + gap[1]}px`,
            backgroundPosition: `${offset[0]}px ${offset[1]}px`,
          }}
        />
      </div>
    );
  },
);

Watermark.displayName = "Watermark";
