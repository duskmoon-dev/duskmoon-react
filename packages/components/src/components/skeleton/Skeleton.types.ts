import type { ComponentProps, ReactNode } from "react";

export type SkeletonVariant =
  | "text"
  | "circle"
  | "rect"
  | "button"
  | "input"
  | "card";

export type SkeletonAnimation = "pulse" | "wave" | "none";

export type SkeletonWidth = "full" | "threeQuarter" | "half" | "quarter";

export interface SkeletonTitleProps {
  width?: SkeletonWidth;
}

export interface SkeletonParagraphProps {
  rows?: number;
  width?: SkeletonWidth | SkeletonWidth[];
}

export interface SkeletonAvatarProps {
  shape?: "circle" | "square";
}

export interface SkeletonProps extends Omit<ComponentProps<"div">, "title"> {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  active?: boolean;
  loading?: boolean;
  avatar?: boolean | SkeletonAvatarProps;
  title?: boolean | SkeletonTitleProps;
  paragraph?: boolean | SkeletonParagraphProps;
  round?: boolean;
}

export interface SkeletonElementProps extends ComponentProps<"div"> {
  active?: boolean;
  animation?: SkeletonAnimation;
  round?: boolean;
}

export interface SkeletonAvatarElementProps extends SkeletonElementProps {
  shape?: "circle" | "square";
}

export interface SkeletonNodeProps extends SkeletonElementProps {
  children?: ReactNode;
}
