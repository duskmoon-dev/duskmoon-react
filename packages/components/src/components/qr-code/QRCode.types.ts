import type { ComponentProps, ReactNode } from "react";

export type QRCodeType = "canvas" | "svg";
export type QRCodeStatus = "active" | "expired" | "loading" | "scanned";
export type QRCodeErrorLevel = "L" | "M" | "Q" | "H";

export interface QRCodeProps
  extends Omit<ComponentProps<"div">, "children" | "onRefresh"> {
  value?: string;
  type?: QRCodeType;
  size?: number;
  icon?: string | ReactNode;
  iconSize?: number;
  status?: QRCodeStatus;
  errorLevel?: QRCodeErrorLevel;
  color?: string;
  bgColor?: string;
  bordered?: boolean;
  onRefresh?: () => void;
}
