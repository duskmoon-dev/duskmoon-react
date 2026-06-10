// GENERATED FILE. DO NOT EDIT.
import { cn } from "../utils";
import type {
  DividerOrientation,
  DividerVariant,
  DividerThickness,
  DividerColor,
  DividerSpacing,
} from "../components/divider/Divider.types";

export const dividerBaseClass = "divider";

export const dividerOrientationClasses: Record<DividerOrientation, string> = {
  horizontal: "",
  vertical: "divider-vertical",
};

export const dividerVariantClasses: Record<DividerVariant, string> = {
  solid: "divider-solid",
  dashed: "divider-dashed",
  dotted: "divider-dotted",
};

export const dividerThicknessClasses: Record<DividerThickness, string> = {
  thin: "divider-thin",
  medium: "divider-medium",
  thick: "divider-thick",
};

export const dividerColorClasses: Record<DividerColor, string> = {
  neutral: "",
  primary: "divider-primary",
  secondary: "divider-secondary",
  tertiary: "divider-tertiary",
};

export const dividerSpacingClasses: Record<DividerSpacing, string> = {
  normal: "",
  compact: "divider-compact",
  comfortable: "divider-comfortable",
  spacious: "divider-spacious",
};

export function getDividerClasses({
  orientation = "horizontal",
  variant = "solid",
  thickness = "thin",
  color = "neutral",
  spacing = "normal",
  className,
}: {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  thickness?: DividerThickness;
  color?: DividerColor;
  spacing?: DividerSpacing;
  className?: string;
}) {
  return cn(
    dividerBaseClass,
    dividerOrientationClasses[orientation],
    dividerVariantClasses[variant],
    dividerThicknessClasses[thickness],
    dividerColorClasses[color],
    dividerSpacingClasses[spacing],
    className,
  );
}
