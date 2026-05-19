// GENERATED FILE. DO NOT EDIT.
import { cn } from "../utils";
import type { CardAppearance, CardPadding } from "../components/card/Card.types";

export const cardBaseClass = "card";

export const cardAppearanceClasses: Record<CardAppearance, string> = {
  elevated: "card-elevated",
  outline: "card-outline",
  filled: "card-filled",
};

export const cardPaddingClasses: Record<CardPadding, string> = {
  none: "card-padding-none",
  sm: "card-padding-sm",
  md: "card-padding-md",
  lg: "card-padding-lg",
};


export function getCardClasses({
  appearance = "elevated",
  padding = "md",
  className,
}: {
  appearance?: CardAppearance;
  padding?: CardPadding;
  className?: string;
}) {
  return cn(
    cardBaseClass,
    cardAppearanceClasses[appearance],
    cardPaddingClasses[padding],
    className
  );
}
