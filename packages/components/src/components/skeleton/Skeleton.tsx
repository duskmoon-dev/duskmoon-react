import React, { forwardRef } from "react";
import {
  getSkeletonClasses,
  skeletonAvatarTextClass,
  skeletonGroupClass,
  skeletonRoundedClass,
} from "../../classes/skeleton";
import { cn } from "../../utils";
import type {
  SkeletonAnimation,
  SkeletonAvatarElementProps,
  SkeletonElementProps,
  SkeletonNodeProps,
  SkeletonParagraphProps,
  SkeletonProps,
  SkeletonVariant,
  SkeletonWidth,
} from "./Skeleton.types";

function resolveAnimation(
  active?: boolean,
  animation?: SkeletonAnimation,
): SkeletonAnimation {
  if (animation) return animation;
  return active ? "wave" : "none";
}

function normalizeRows(paragraph: SkeletonProps["paragraph"]) {
  if (paragraph === false) return 0;
  if (typeof paragraph === "object" && paragraph.rows !== undefined) {
    return Math.max(0, Math.floor(paragraph.rows));
  }
  return 3;
}

function resolveWidth(
  width: SkeletonParagraphProps["width"],
  index: number,
  total: number,
): SkeletonWidth | undefined {
  if (Array.isArray(width)) return width[index];
  if (width) return width;
  return total > 1 && index === total - 1 ? "threeQuarter" : undefined;
}

function SkeletonLine({
  animation,
  round,
  width,
}: {
  animation: SkeletonAnimation;
  round?: boolean;
  width?: SkeletonWidth;
}) {
  return (
    <div
      className={getSkeletonClasses({
        variant: "text",
        animation,
        round,
        width,
      })}
    />
  );
}

function SkeletonPrimitive({
  variant,
  active,
  animation,
  round,
  className,
  children,
  ...props
}: SkeletonElementProps & { variant: SkeletonVariant }) {
  return (
    <div
      aria-hidden={children ? undefined : true}
      className={getSkeletonClasses({
        variant,
        animation: resolveAnimation(active, animation),
        round,
        className,
      })}
      {...props}
    >
      {children}
    </div>
  );
}

const SkeletonRoot = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant,
      animation,
      active,
      loading = true,
      avatar = false,
      title = true,
      paragraph = true,
      round,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    if (!loading) {
      return children ? <>{children}</> : null;
    }

    const resolvedAnimation = resolveAnimation(active, animation);

    if (variant) {
      return (
        <div
          ref={ref}
          aria-hidden={true}
          className={getSkeletonClasses({
            variant,
            animation: resolvedAnimation,
            round,
            className,
          })}
          {...props}
        />
      );
    }

    const avatarConfig = typeof avatar === "object" ? avatar : undefined;
    const titleConfig = typeof title === "object" ? title : undefined;
    const paragraphConfig =
      typeof paragraph === "object" ? paragraph : undefined;
    const rows = normalizeRows(paragraph);
    const showTitle = title !== false;

    return (
      <div
        ref={ref}
        aria-busy={true}
        className={cn(
          avatar ? skeletonAvatarTextClass : skeletonGroupClass,
          className,
        )}
        {...props}
      >
        {avatar && (
          <div
            className={getSkeletonClasses({
              variant: avatarConfig?.shape === "square" ? "rect" : "circle",
              animation: resolvedAnimation,
              round,
              className:
                avatarConfig?.shape === "square"
                  ? skeletonRoundedClass
                  : undefined,
            })}
          />
        )}
        <div className={skeletonGroupClass}>
          {showTitle && (
            <SkeletonLine
              animation={resolvedAnimation}
              round={round}
              width={titleConfig?.width}
            />
          )}
          {Array.from({ length: rows }, (_, index) => (
            <SkeletonLine
              key={index}
              animation={resolvedAnimation}
              round={round}
              width={resolveWidth(paragraphConfig?.width, index, rows)}
            />
          ))}
        </div>
      </div>
    );
  },
);

SkeletonRoot.displayName = "Skeleton";

const SkeletonButton = forwardRef<HTMLDivElement, SkeletonElementProps>(
  (props, ref) => <SkeletonPrimitive ref={ref} variant="button" {...props} />,
);

SkeletonButton.displayName = "Skeleton.Button";

const SkeletonInput = forwardRef<HTMLDivElement, SkeletonElementProps>(
  (props, ref) => <SkeletonPrimitive ref={ref} variant="input" {...props} />,
);

SkeletonInput.displayName = "Skeleton.Input";

const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarElementProps>(
  ({ shape = "circle", className, ...props }, ref) => (
    <SkeletonPrimitive
      ref={ref}
      variant={shape === "square" ? "rect" : "circle"}
      className={cn(shape === "square" && skeletonRoundedClass, className)}
      {...props}
    />
  ),
);

SkeletonAvatar.displayName = "Skeleton.Avatar";

const SkeletonImage = forwardRef<HTMLDivElement, SkeletonElementProps>(
  (props, ref) => <SkeletonPrimitive ref={ref} variant="rect" {...props} />,
);

SkeletonImage.displayName = "Skeleton.Image";

const SkeletonNode = forwardRef<HTMLDivElement, SkeletonNodeProps>(
  (props, ref) => <SkeletonPrimitive ref={ref} variant="rect" {...props} />,
);

SkeletonNode.displayName = "Skeleton.Node";

export const Skeleton = Object.assign(SkeletonRoot, {
  Button: SkeletonButton,
  Input: SkeletonInput,
  Avatar: SkeletonAvatar,
  Image: SkeletonImage,
  Node: SkeletonNode,
});

export {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonInput,
  SkeletonNode,
};
