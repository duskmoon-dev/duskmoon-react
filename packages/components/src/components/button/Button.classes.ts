import { cn } from "../../utils";
import type {
  ButtonColor,
  ButtonAppearance,
  ButtonShape,
  ButtonSize,
} from "./Button.types";
import {
  buttonBaseClass,
  buttonColorClasses,
  buttonAppearanceClasses,
  buttonShapeClasses,
  buttonSizeClasses,
  buttonBlockClass,
  buttonLoadingClass,
} from "../../classes/button";

export function getButtonClasses({
  color = "primary",
  appearance = "filled",
  shape = "rect",
  size = "md",
  block,
  isLoading,
  className,
}: {
  color?: ButtonColor;
  appearance?: ButtonAppearance;
  shape?: ButtonShape;
  size?: ButtonSize;
  block?: boolean;
  isLoading?: boolean;
  className?: string;
}) {
  return cn(
    buttonBaseClass,
    buttonColorClasses[color],
    buttonAppearanceClasses[appearance],
    buttonShapeClasses[shape],
    buttonSizeClasses[size],
    block && buttonBlockClass,
    isLoading && buttonLoadingClass,
    className,
  );
}
