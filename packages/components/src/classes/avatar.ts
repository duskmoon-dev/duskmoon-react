// GENERATED FILE. DO NOT EDIT.
import { cn } from "../utils";
import type {
  AvatarSize,
  AvatarShape,
} from "../components/avatar/Avatar.types";

export const avatarBaseClass = "avatar";

export const avatarSizeClasses: Record<AvatarSize, string> = {
  xs: "avatar-xs",
  sm: "avatar-sm",
  md: "avatar-md",
  lg: "avatar-lg",
  xl: "avatar-xl",
};

export const avatarShapeClasses: Record<AvatarShape, string> = {
  circle: "avatar-circle",
  square: "avatar-square",
};

export function getAvatarClasses({
  size = "md",
  shape = "circle",
  className,
}: {
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}) {
  return cn(
    avatarBaseClass,
    avatarSizeClasses[size],
    avatarShapeClasses[shape],
    className,
  );
}
