// GENERATED FILE. DO NOT EDIT.
import type { ComponentProps } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export type AvatarShape = "circle" | "square";

export interface AvatarProps extends ComponentProps<"span"> {
  size?: AvatarSize;
  shape?: AvatarShape;
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}
