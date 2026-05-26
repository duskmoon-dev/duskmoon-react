import type { ComponentProps, CSSProperties, ReactNode } from "react";

export interface WatermarkFont {
  color?: string;
  fontSize?: number;
  fontWeight?: CSSProperties["fontWeight"];
  fontFamily?: string;
  fontStyle?: CSSProperties["fontStyle"];
}

export interface WatermarkProps extends Omit<ComponentProps<"div">, "content"> {
  content?: ReactNode;
  image?: string;
  width?: number;
  height?: number;
  rotate?: number;
  zIndex?: number;
  gap?: [number, number];
  offset?: [number, number];
  font?: WatermarkFont;
  inherit?: boolean;
}
